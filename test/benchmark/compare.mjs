// Compare two builds of textlint, the base and the head, on fixed sets of documents.
// See docs/products/textlint/features/change-comparison/
//
// Usage: pnpm run compare [--base <ref>] [--set small,medium,large,huge] [--measure cli,in-process] [--runs <n>]
//                         [--out-dir <dir>] [--cache-dir <dir>] [--no-build] [--render <compare.json>]...
//
// It uses only the built-in modules of Node.js, so it runs on a fresh checkout and compares any two commits.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";

const HEAD_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const BENCHMARK_DIR = path.join(HEAD_ROOT, "test/benchmark");
const CONFIG_FILE = path.join(BENCHMARK_DIR, ".textlintrc.jtf-style.json");
const SET_NAMES = ["small", "medium", "large", "huge"];
// What a comparison measures: the CLI (lint results, profile, CPU profile, run time),
// and the in-process benchmarks (parsers, traversal, and their CPU profiles)
const MEASURE_NAMES = ["cli", "in-process"];
const SMALL_RUNS = 10;
// The number of runs of the in-process benchmarks for each run of the CLI
const MICRO_RUNS_FACTOR = 2;
// the in-process benchmarks run in this many rounds, the base and the head in turns
const MICRO_ROUNDS = 3;
const MAX_ROWS = 50;
const TOP_ROWS = 15;
const CLI_MARK = { slower: 1.3, faster: 0.77 };
const MICRO_MARK = { slower: 1.1, faster: 0.91 };
const MIN_MARKED_MS = 1;

class CompareError extends Error {}

// ---------------------------------------------------------------------------
// Commands

const run = (command, args, options = {}) => {
    const result = spawnSync(command, args, {
        cwd: options.cwd ?? HEAD_ROOT,
        encoding: "utf-8",
        maxBuffer: 1024 * 1024 * 1024,
        stdio: options.inherit ? ["ignore", "inherit", "inherit"] : ["ignore", "pipe", "pipe"],
        env: { ...process.env, ...options.env }
    });
    if (result.error) {
        throw new CompareError(`${command} ${args.join(" ")} failed: ${result.error.message}`);
    }
    const okStatuses = options.okStatuses ?? [0];
    if (!okStatuses.includes(result.status)) {
        throw new CompareError(
            `${options.label ?? command} failed with the exit status ${result.status}: ${command} ${args.join(" ")}\n${
                result.stderr ?? ""
            }`
        );
    }
    return result;
};
/**
 * `run` without blocking, for the commands that run at the same time as others.
 * Only preparation and runs that are not timed use it.
 */
const children = new Set();
const runAsync = (command, args, options = {}) =>
    new Promise((resolve, reject) => {
        const child = spawn(command, args, {
            cwd: options.cwd ?? HEAD_ROOT,
            stdio: ["ignore", "pipe", "pipe"],
            env: { ...process.env, ...options.env }
        });
        children.add(child);
        const stdout = [];
        const stderr = [];
        child.stdout.on("data", (chunk) => stdout.push(chunk));
        child.stderr.on("data", (chunk) => stderr.push(chunk));
        child.on("error", (error) => {
            children.delete(child);
            reject(new CompareError(`${command} ${args.join(" ")} failed: ${error.message}`));
        });
        child.on("close", (status) => {
            children.delete(child);
            const result = {
                status,
                stdout: Buffer.concat(stdout).toString("utf-8"),
                stderr: Buffer.concat(stderr).toString("utf-8")
            };
            if ((options.okStatuses ?? [0]).includes(status)) {
                resolve(result);
                return;
            }
            reject(
                new CompareError(
                    `${options.label ?? command} failed with the exit status ${status}: ${command} ${args.join(" ")}\n${
                        result.stderr
                    }`
                )
            );
        });
    });
/**
 * Run the tasks, at most `limit` at the same time, and return their results in the order of the tasks.
 */
const runPool = async (tasks, limit) => {
    const results = [];
    let next = 0;
    const worker = async () => {
        while (next < tasks.length) {
            const index = next++;
            results[index] = await tasks[index]();
        }
    };
    await Promise.all(Array.from({ length: Math.max(1, Math.min(limit, tasks.length)) }, worker));
    return results;
};
// A run that is not timed takes one CPU and the garbage collector uses more, so half of the CPUs run at the same time
const UNTIMED_CONCURRENCY = Math.max(1, Math.floor(os.availableParallelism() / 2));
const log = (message) => process.stderr.write(`[compare] ${message}\n`);
const git = (args, cwd = HEAD_ROOT) => run("git", args, { cwd }).stdout.trim();
const gitAsync = async (args, cwd = HEAD_ROOT) => (await runAsync("git", args, { cwd })).stdout.trim();

// ---------------------------------------------------------------------------
// Builds

const resolveCommit = (ref) => git(["rev-parse", "--verify", `${ref}^{commit}`]);
const defaultBase = () => {
    for (const ref of ["origin/master", "master"]) {
        if (
            spawnSync("git", ["rev-parse", "--verify", `${ref}^{commit}`], { cwd: HEAD_ROOT, stdio: "ignore" })
                .status === 0
        ) {
            return ref;
        }
    }
    throw new CompareError("No base: neither origin/master nor master exists. Pass --base <ref>.");
};

/**
 * Hold a lock directory while preparing an entry of the cache.
 * A lock of a running process stops this comparison; a stale lock is reported and not removed.
 */
const withLock = async (entry, fn) => {
    const lock = `${entry}.lock`;
    fs.mkdirSync(path.dirname(lock), { recursive: true });
    try {
        fs.mkdirSync(lock);
    } catch {
        throw new CompareError(
            `${lock} exists. Another comparison prepares it, or a comparison was killed: remove the directory and run again.`
        );
    }
    fs.writeFileSync(path.join(lock, "pid"), String(process.pid));
    try {
        return await fn();
    } finally {
        fs.rmSync(lock, { recursive: true, force: true });
    }
};

const buildPackages = async (root, label) => {
    log(`building ${label}`);
    await runAsync("pnpm", ["--filter", "./packages/**", "run", "build"], {
        cwd: root,
        label: `the build of ${label}`
    });
};

const prepareBase = async (commit, cacheDir) => {
    const dir = path.join(cacheDir, `base-${commit}`);
    const marker = path.join(dir, ".compare-built");
    if (fs.existsSync(marker)) {
        return dir;
    }
    return withLock(dir, async () => {
        if (fs.existsSync(marker)) {
            return dir;
        }
        if (fs.existsSync(dir)) {
            spawnSync("git", ["worktree", "remove", "--force", dir], { cwd: HEAD_ROOT, stdio: "ignore" });
            fs.rmSync(dir, { recursive: true, force: true });
        }
        spawnSync("git", ["worktree", "prune"], { cwd: HEAD_ROOT, stdio: "ignore" });
        log(`creating a worktree of the base ${commit.slice(0, 12)}`);
        await gitAsync(["worktree", "add", "--detach", dir, commit]);
        log("installing the dependencies of the base");
        await runAsync("pnpm", ["install", "--frozen-lockfile"], { cwd: dir, label: "pnpm install of the base" });
        await buildPackages(dir, "the base");
        fs.writeFileSync(marker, commit);
        return dir;
    });
};

const textlintBin = (root) => path.join(root, "packages/textlint/bin/textlint.js");
const supportsProfile = (root) => {
    const help = spawnSync(process.execPath, [textlintBin(root), "--help"], { encoding: "utf-8" });
    return help.stdout.includes("--profile");
};

// ---------------------------------------------------------------------------
// Sets of documents

const loadSets = () => JSON.parse(fs.readFileSync(path.join(BENCHMARK_DIR, "compare-sets.json"), "utf-8"));

const prepareSet = async (name, sets, cacheDir) => {
    if (name === "small") {
        return {
            name,
            repository: null,
            commit: null,
            label: null,
            dir: path.join(BENCHMARK_DIR, "examples"),
            runs: SMALL_RUNS
        };
    }
    const set = sets[name];
    if (!set) {
        throw new CompareError(`Unknown set: ${name}. Sets: ${SET_NAMES.join(", ")}`);
    }
    const dir = path.join(cacheDir, "sets", `${name}-${set.commit}`);
    const marker = path.join(dir, ".compare-ready");
    if (!fs.existsSync(marker)) {
        await withLock(dir, async () => {
            if (fs.existsSync(marker)) {
                return;
            }
            fs.rmSync(dir, { recursive: true, force: true });
            fs.mkdirSync(dir, { recursive: true });
            log(`downloading ${set.repository} ${set.commit.slice(0, 12)} (${set.path})`);
            await gitAsync(["init", "--quiet"], dir);
            await gitAsync(["remote", "add", "origin", set.repository], dir);
            await gitAsync(["sparse-checkout", "set", "--no-cone", `/${set.path}/**`], dir);
            await gitAsync(["fetch", "--quiet", "--depth", "1", "--filter=blob:none", "origin", set.commit], dir);
            await gitAsync(["checkout", "--quiet", "FETCH_HEAD"], dir);
            fs.writeFileSync(marker, set.commit);
        });
    }
    return {
        name,
        repository: set.repository,
        commit: set.commit,
        label: set.label,
        dir: path.join(dir, set.path),
        runs: set.runs
    };
};

const countMarkdownFiles = (dir) => {
    let count = 0;
    const walk = (current) => {
        for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
            if (entry.isDirectory()) {
                walk(path.join(current, entry.name));
            } else if (entry.isFile() && entry.name.endsWith(".md")) {
                count++;
            }
        }
    };
    walk(dir);
    return count;
};

// ---------------------------------------------------------------------------
// Runs

const cliArgs = (root, set) => [
    textlintBin(root),
    "--config",
    CONFIG_FILE,
    "--rules-base-directory",
    path.join(root, "test/benchmark/node_modules"),
    set.dir
];

/**
 * Lint the set once. It returns the lint results and, when the build has --profile, its profile.
 */
const lintOnce = async (root, set, label, tmpDir) => {
    const resultsFile = path.join(tmpDir, `results-${label}.json`);
    const withProfile = supportsProfile(root);
    const args = [...cliArgs(root, set), "--format", "json", "--output-file", resultsFile];
    if (withProfile) {
        args.push("--profile");
    }
    // 0: no error, 1: errors are found
    const result = await runAsync(process.execPath, args, {
        cwd: set.dir,
        okStatuses: [0, 1],
        label: `the lint of ${label}`
    });
    const results = JSON.parse(fs.readFileSync(resultsFile, "utf-8"));
    return {
        results,
        profile: withProfile ? JSON.parse(result.stdout) : null
    };
};

const cpuProfile = async (args, name, label, set, outDir) => {
    const dir = path.join(outDir, "cpuprofiles");
    fs.mkdirSync(dir, { recursive: true });
    const fileName = `${set.name}-${label}-${name}.cpuprofile`;
    await runAsync(process.execPath, ["--cpu-prof", "--cpu-prof-dir", dir, "--cpu-prof-name", fileName, ...args], {
        cwd: set.dir,
        okStatuses: [0, 1],
        label: `the ${name} run of ${label}`
    });
    return path.join(dir, fileName);
};

const microArgs = (root, set, mode, runs) => [
    path.join(BENCHMARK_DIR, "micro.mjs"),
    "--build",
    root,
    "--dir",
    set.dir,
    "--mode",
    mode,
    "--runs",
    String(runs)
];

/**
 * Merge the stats of the rounds of a build.
 * The min is the min of all runs, and the median is the median of the medians of the rounds.
 */
const mergeStats = (rounds) => {
    const medians = rounds.map((stats) => stats.median).sort((a, b) => a - b);
    return {
        median: medians[Math.floor(medians.length / 2)],
        min: Math.min(...rounds.map((stats) => stats.min)),
        max: Math.max(...rounds.map((stats) => stats.max)),
        runs: rounds.reduce((sum, stats) => sum + stats.runs, 0),
        repeat: rounds[0].repeat
    };
};
const mergeMicroResults = (results, mode) => {
    if (mode === "parse") {
        const parsers = {};
        for (const id of Object.keys(results[0].parsers)) {
            parsers[id] = mergeStats(results.map((result) => result.parsers[id]));
        }
        return { ...results[0], parsers };
    }
    return { ...results[0], kernel: { traverse: mergeStats(results.map((result) => result.kernel.traverse)) } };
};

/**
 * Measure a mode of the base and the head in MICRO_ROUNDS rounds, base and head in turns, each in a new process,
 * one process at a time, so a change of the machine during the measurement affects both builds.
 * The measuring processes do not record a CPU profile, because the sampling adds noise.
 */
const microBench = (roots, set, mode) => {
    const runsPerRound = Math.max(1, Math.ceil((set.runs * MICRO_RUNS_FACTOR) / MICRO_ROUNDS));
    const results = { base: [], head: [] };
    for (let round = 0; round < MICRO_ROUNDS; round++) {
        for (const label of ["base", "head"]) {
            const { stdout } = run(
                process.execPath,
                ["--expose-gc", ...microArgs(roots[label], set, mode, runsPerRound)],
                {
                    cwd: set.dir,
                    label: `the ${mode} benchmark of ${label}`
                }
            );
            results[label].push(JSON.parse(stdout));
        }
    }
    return {
        base: mergeMicroResults(results.base, mode),
        head: mergeMicroResults(results.head, mode)
    };
};

const cliStats = (times) => {
    const sorted = [...times].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    const mean = sorted.reduce((sum, time) => sum + time, 0) / sorted.length;
    return {
        median: sorted.length % 2 === 1 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2,
        mean,
        stddev:
            sorted.length > 1
                ? Math.sqrt(sorted.reduce((sum, time) => sum + (time - mean) ** 2, 0) / (sorted.length - 1))
                : 0,
        runs: sorted.length
    };
};

/**
 * Measure the run time of the CLI in `runs` rounds, one process at a time.
 * Each round runs the base and the head, and the next round runs them in the other order,
 * so a change of the machine during the measurement affects both builds.
 * No run warms up: the runs for the profile and the CPU profile before it read the same files with both builds.
 */
const measureCliTime = (roots, set, runs) => {
    log(`measuring the run time of the CLI on ${set.name} (${runs} runs of each build)`);
    const times = { base: [], head: [] };
    for (let round = 0; round < runs; round++) {
        for (const label of round % 2 === 0 ? ["base", "head"] : ["head", "base"]) {
            const start = performance.now();
            run(process.execPath, [...cliArgs(roots[label], set), "--format", "json", "--output-file", os.devNull], {
                cwd: set.dir,
                okStatuses: [0, 1],
                label: `the timed run of ${label}`
            });
            times[label].push(performance.now() - start);
        }
    }
    return withRatio(cliStats(times.base), cliStats(times.head), CLI_MARK);
};

/**
 * The ratio of the head to the base, and its mark.
 * `key` is the statistic to compare: the median for the CLI, and the minimum for the in-process benchmarks,
 * because noise of a machine only makes a run slower.
 */
const withRatio = (base, head, marks, key = "median") => {
    const ratio = base[key] > 0 ? head[key] / base[key] : 1;
    // a time below 1 ms is too short to tell a change from noise
    const measurable = Math.max(base[key], head[key]) >= MIN_MARKED_MS;
    const mark = !measurable ? null : ratio >= marks.slower ? "slower" : ratio <= marks.faster ? "faster" : null;
    return { base, head, ratio, mark };
};

// ---------------------------------------------------------------------------
// Differences

const messageKey = (message) =>
    `${message.file}\t${message.line}\t${message.column}\t${message.ruleId}\t${message.message}`;
const flattenResults = (results, dir) =>
    results.flatMap((result) =>
        result.messages.map((message) => ({
            file: path.relative(dir, result.filePath).split(path.sep).join("/"),
            line: message.line,
            column: message.column,
            ruleId: message.ruleId,
            message: message.message
        }))
    );
/**
 * The messages that only one build has, as multisets
 */
const diffMessages = (baseMessages, headMessages) => {
    const counts = new Map();
    for (const message of baseMessages) {
        const key = messageKey(message);
        counts.set(key, { message, count: (counts.get(key)?.count ?? 0) - 1 });
    }
    for (const message of headMessages) {
        const key = messageKey(message);
        counts.set(key, { message, count: (counts.get(key)?.count ?? 0) + 1 });
    }
    const added = [];
    const removed = [];
    for (const { message, count } of counts.values()) {
        for (let i = 0; i < Math.abs(count); i++) {
            (count > 0 ? added : removed).push(message);
        }
    }
    const order = (a, b) => (a.file === b.file ? a.line - b.line || a.column - b.column : a.file < b.file ? -1 : 1);
    return { added: added.sort(order), removed: removed.sort(order) };
};

/**
 * Self time of a CPU profile by package and by function.
 * A package of this repository is found by the path under `<root>/packages/`, and a dependency by the path after the last `node_modules/`.
 */
const summarizeCpuProfile = (file, root) => {
    const profile = JSON.parse(fs.readFileSync(file, "utf-8"));
    const nodes = new Map(profile.nodes.map((node) => [node.id, node]));
    const selfTimes = new Map();
    let total = 0;
    for (let i = 0; i < profile.samples.length; i++) {
        const delta = profile.timeDeltas[i] ?? 0;
        total += delta;
        selfTimes.set(profile.samples[i], (selfTimes.get(profile.samples[i]) ?? 0) + delta);
    }
    const packagesRoot = `${path.join(root, "packages")}${path.sep}`;
    const packageOf = (url, functionName) => {
        if (!url) {
            // samples of V8 itself, or native functions such as fs bindings
            return ["(garbage collector)", "(program)", "(idle)", "(root)"].includes(functionName)
                ? functionName
                : "(native)";
        }
        if (url.startsWith("node:")) {
            return "(node)";
        }
        const filePath = url.startsWith("file://") ? fileURLToPath(url) : url;
        const index = filePath.lastIndexOf(`${path.sep}node_modules${path.sep}`);
        if (index !== -1) {
            const parts = filePath.slice(index + "/node_modules/".length).split(path.sep);
            return { name: parts[0].startsWith("@") ? `${parts[0]}/${parts[1]}` : parts[0], workspace: false };
        }
        if (filePath.startsWith(packagesRoot)) {
            const parts = filePath.slice(packagesRoot.length).split(path.sep);
            return { name: parts[0].startsWith("@") ? `${parts[0]}/${parts[1]}` : parts[0], workspace: true };
        }
        return "(other)";
    };
    const packages = new Map();
    const functions = new Map();
    for (const [id, time] of selfTimes) {
        const { callFrame } = nodes.get(id);
        const owner = packageOf(callFrame.url, callFrame.functionName);
        const name = typeof owner === "string" ? owner : owner.name;
        const workspace = typeof owner !== "string" && owner.workspace;
        const entry = packages.get(name) ?? { name, workspace, time: 0 };
        entry.time += time;
        packages.set(name, entry);
        const location = callFrame.url ? `${path.basename(callFrame.url)}:${callFrame.lineNumber + 1}` : "";
        const key = `${callFrame.functionName}\t${name}\t${location}`;
        const fn = functions.get(key) ?? {
            name: callFrame.functionName || "(anonymous)",
            package: name,
            location,
            time: 0
        };
        fn.time += time;
        functions.set(key, fn);
    }
    const ms = (value) => value / 1000;
    return {
        total: ms(total),
        packages: [...packages.values()]
            .map((entry) => ({ ...entry, time: ms(entry.time) }))
            .sort((a, b) => b.time - a.time),
        functions: [...functions.values()]
            .map((entry) => ({ ...entry, time: ms(entry.time) }))
            .sort((a, b) => b.time - a.time)
            .slice(0, 50)
    };
};

// ---------------------------------------------------------------------------
// One set

/**
 * Compare the base and the head on a set.
 * `measure` selects what is measured; what is not measured is `null` in the result (and absent in `cpu`).
 */
const compareSet = async (set, roots, outDir, measure) => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "textlint-compare-"));
    const labels = ["base", "head"];
    const withCli = measure.includes("cli");
    const withInProcess = measure.includes("in-process");
    try {
        // The runs that are not timed come first and run at the same time: the lint with the profile and the CPU profiles
        const lint = {};
        const cpuFiles = { base: {}, head: {} };
        const untimed = [];
        if (withCli) {
            for (const label of labels) {
                untimed.push(async () => {
                    lint[label] = await lintOnce(roots[label], set, label, tmpDir);
                });
            }
            for (const label of labels) {
                untimed.push(async () => {
                    cpuFiles[label].cli = await cpuProfile(
                        [...cliArgs(roots[label], set), "--format", "json", "--output-file", os.devNull],
                        "cli",
                        label,
                        set,
                        outDir
                    );
                });
            }
        }
        if (withInProcess) {
            for (const mode of ["traverse", "parse"]) {
                for (const label of labels) {
                    untimed.push(async () => {
                        cpuFiles[label][mode] = await cpuProfile(
                            ["--expose-gc", ...microArgs(roots[label], set, mode, 1)],
                            mode,
                            label,
                            set,
                            outDir
                        );
                    });
                }
            }
        }
        log(
            `${withCli ? "linting" : "running"} ${set.name} with the base and the head, and recording the CPU profiles`
        );
        await runPool(untimed, UNTIMED_CONCURRENCY);
        const cpu = { base: {}, head: {} };
        for (const label of labels) {
            // in the order of the output
            for (const kind of ["cli", "parse", "traverse"]) {
                if (cpuFiles[label][kind]) {
                    cpu[label][kind] = summarizeCpuProfile(cpuFiles[label][kind], roots[label]);
                }
            }
        }
        const result = {
            name: set.name,
            repository: set.repository,
            commit: set.commit,
            label: set.label,
            files: countMarkdownFiles(set.dir),
            messages: null,
            time: null,
            parsers: null,
            traverse: null,
            profiles: null,
            cpu
        };
        if (withCli) {
            const messages = {
                base: flattenResults(lint.base.results, set.dir),
                head: flattenResults(lint.head.results, set.dir)
            };
            result.messages = {
                base: messages.base.length,
                head: messages.head.length,
                ...diffMessages(messages.base, messages.head)
            };
            result.profiles = { base: lint.base.profile, head: lint.head.profile };
        }
        // The timed runs: one process at a time
        if (withInProcess) {
            const micro = {};
            for (const mode of ["parse", "traverse"]) {
                log(`measuring ${mode} on ${set.name}`);
                micro[mode] = microBench(roots, set, mode);
            }
            result.parsers = Object.keys(micro.parse.head.parsers).map((id) => ({
                id,
                ...withRatio(micro.parse.base.parsers[id], micro.parse.head.parsers[id], MICRO_MARK, "min")
            }));
            result.traverse = withRatio(
                micro.traverse.base.kernel.traverse,
                micro.traverse.head.kernel.traverse,
                MICRO_MARK,
                "min"
            );
        }
        if (withCli) {
            result.time = measureCliTime(roots, set, set.runs);
        }
        return result;
    } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    }
};

/**
 * The results of one set from comparisons that measured different things, as one result.
 */
const mergeSetResults = (results) => {
    const byName = new Map();
    for (const result of results) {
        const merged = byName.get(result.name);
        if (!merged) {
            byName.set(result.name, { ...result, cpu: { base: { ...result.cpu.base }, head: { ...result.cpu.head } } });
            continue;
        }
        for (const key of ["messages", "time", "parsers", "traverse", "profiles"]) {
            merged[key] ??= result[key];
        }
        Object.assign(merged.cpu.base, result.cpu.base);
        Object.assign(merged.cpu.head, result.cpu.head);
    }
    return [...byName.values()];
};

// ---------------------------------------------------------------------------
// Markdown

const REPOSITORY = "https://github.com/textlint/textlint";
const escapeCell = (text) =>
    String(text)
        // eslint-disable-next-line no-control-regex
        .replace(/[\u0000-\u001f\u007f-\u009f]/g, " ")
        .replace(/\\/g, "\\\\")
        .replace(/\|/g, "\\|")
        .replace(/`/g, "\\`");
const fmt = (value) => (value === undefined || value === null ? "-" : value.toFixed(2));
const fmtRatio = (ratio) => `${ratio.toFixed(2)}x`;
const markText = (mark) => (mark === "slower" ? " ⚠️ slower" : mark === "faster" ? " faster" : "");
// The first `leftColumns` columns are text, and the others are numbers
const table = (headers, rows, leftColumns = 1) =>
    [
        `| ${headers.join(" | ")} |`,
        `| ${headers.map((_, index) => (index < leftColumns ? "---" : "---:")).join(" | ")} |`,
        ...rows.map((row) => `| ${row.join(" | ")} |`)
    ].join("\n");
const commitLink = (repository, commit) =>
    commit ? `[\`${commit.slice(0, 12)}\`](${repository}/commit/${commit})` : "-";

/**
 * What changed in a set, for the verdict
 */
const changesOf = (set) => {
    const changes = [];
    if (set.messages && (set.messages.added.length > 0 || set.messages.removed.length > 0)) {
        changes.push(`lint results (+${set.messages.added.length} −${set.messages.removed.length})`);
    }
    for (const parser of set.parsers ?? []) {
        if (parser.mark) {
            changes.push(`${parser.id} ${parser.mark} (${fmtRatio(parser.ratio)})`);
        }
    }
    if (set.traverse?.mark) {
        changes.push(`traverse ${set.traverse.mark} (${fmtRatio(set.traverse.ratio)})`);
    }
    if (set.time?.mark) {
        changes.push(`CLI ${set.time.mark} (${fmtRatio(set.time.ratio)})`);
    }
    return changes;
};
const verdictOf = (set) => {
    const changes = changesOf(set);
    // a comparison that did not measure the CLI has no lint results, and must not say that they are the same
    const missing = set.messages ? "" : " (lint results and CLI: not measured)";
    if (changes.length === 0) {
        return set.messages
            ? `✅ No change in lint results${set.time ? `, CLI ${fmtRatio(set.time.ratio)}` : ""}`
            : `✅ No marked change${missing}`;
    }
    return `⚠️ Changed: ${changes.join(", ")}${missing}`;
};

const renderProfiles = (profiles) => {
    const { base, head } = profiles ?? {};
    if (!head) {
        return "";
    }
    const lines = [];
    const phaseNames = [...new Set([...(base?.phases ?? []), ...head.phases].map((phase) => phase.name))];
    const phaseOf = (profile, name) => profile?.phases.find((phase) => phase.name === name);
    const phaseName = (phase) => `${phase.depth > 0 ? "↳ " : ""}${phase.name}`;
    if (base) {
        lines.push(
            table(
                ["Phase", "Base (ms)", "Head (ms)", "Ratio"],
                phaseNames.map((name) => {
                    const b = phaseOf(base, name);
                    const h = phaseOf(head, name);
                    return [
                        phaseName(h ?? b),
                        fmt(b?.time),
                        fmt(h?.time),
                        b && h && Math.max(b.time, h.time) >= 1 ? fmtRatio(h.time / b.time) : "-"
                    ];
                })
            )
        );
    } else {
        // the base was built before --profile existed: show the head only, without empty columns
        lines.push("The base has no `--profile`, so only the profile of the head is shown.");
        lines.push(
            table(
                ["Phase", "Head (ms)", "%"],
                head.phases.map((phase) => [phaseName(phase), fmt(phase.time), `${phase.percent.toFixed(1)}%`])
            )
        );
    }
    const ruleOf = (profile, id) => profile?.rules.find((rule) => rule.id === id);
    const topRules = head.rules.slice(0, 10);
    lines.push(
        `Top ${topRules.length} rules of the head:\n\n${
            base
                ? table(
                      ["Rule", "Base (ms)", "Head (ms)", "Calls (head)"],
                      topRules.map((rule) => [
                          escapeCell(rule.id),
                          fmt(ruleOf(base, rule.id)?.time),
                          fmt(rule.time),
                          String(rule.count)
                      ])
                  )
                : table(
                      ["Rule", "Time (ms)", "Calls"],
                      topRules.map((rule) => [escapeCell(rule.id), fmt(rule.time), String(rule.count)])
                  )
        }`
    );
    if (head.slowestFiles.length > 0) {
        lines.push(
            `Slowest files of the head:\n\n${table(
                ["File", "Time (ms)"],
                head.slowestFiles.slice(0, 5).map((file) => [escapeCell(file.filePath), fmt(file.time)])
            )}`
        );
    }
    return lines.join("\n\n");
};

const renderCpu = (cpu, kind) => {
    const base = cpu.base[kind];
    const head = cpu.head[kind];
    if (!base || !head) {
        return "";
    }
    const basePackage = (name) => base.packages.find((entry) => entry.name === name);
    const packages = table(
        ["Package", "Base (ms)", "Head (ms)", "Ratio"],
        head.packages.slice(0, TOP_ROWS).map((entry) => {
            const b = basePackage(entry.name);
            return [
                `${escapeCell(entry.name)}${entry.workspace ? " ✱" : ""}`,
                fmt(b?.time),
                fmt(entry.time),
                b && Math.max(b.time, entry.time) >= 1 ? fmtRatio(entry.time / b.time) : "-"
            ];
        })
    );
    const functions = table(
        ["Function (head)", "Package", "Location", "Self (ms)"],
        head.functions
            .slice(0, TOP_ROWS)
            .map((fn) => [escapeCell(fn.name), escapeCell(fn.package), escapeCell(fn.location), fmt(fn.time)]),
        3
    );
    return `Total sampled: base ${fmt(base.total)} ms, head ${fmt(
        head.total
    )} ms. ✱ is a package of this repository.\n\n${packages}\n\n${functions}`;
};

const renderMessages = (title, messages) => {
    if (messages.length === 0) {
        return "";
    }
    const rows = messages
        .slice(0, MAX_ROWS)
        .map((message) => [
            escapeCell(message.file),
            String(message.line),
            String(message.column),
            escapeCell(message.ruleId),
            escapeCell(message.message)
        ]);
    const more = messages.length > MAX_ROWS ? `\n\n${messages.length - MAX_ROWS} more in the JSON output.` : "";
    return `${title} (${messages.length}):\n\n${table(["File", "Line", "Column", "Rule", "Message"], rows)}${more}`;
};

const renderSet = (set) => {
    const source = set.repository
        ? `${set.repository} at ${commitLink(set.repository, set.commit)} (${escapeCell(set.label)})`
        : "`test/benchmark/examples`";
    const parts = [`### ${set.name}: ${source}, ${set.files} files`, verdictOf(set)];
    // only what the comparison measured has a row
    const summaryRows = [];
    if (set.time) {
        summaryRows.push([
            "CLI run time (median, ms)",
            fmt(set.time.base.median),
            fmt(set.time.head.median),
            `${fmtRatio(set.time.ratio)}${markText(set.time.mark)}`
        ]);
    }
    for (const parser of set.parsers ?? []) {
        summaryRows.push([
            `parse: ${parser.id} (min, ms)`,
            fmt(parser.base.min),
            fmt(parser.head.min),
            `${fmtRatio(parser.ratio)}${markText(parser.mark)}`
        ]);
    }
    if (set.traverse) {
        summaryRows.push([
            "traverse + dispatch with a no-op rule (min, ms)",
            fmt(set.traverse.base.min),
            fmt(set.traverse.head.min),
            `${fmtRatio(set.traverse.ratio)}${markText(set.traverse.mark)}`
        ]);
    }
    if (set.messages) {
        summaryRows.push([
            "messages",
            String(set.messages.base),
            String(set.messages.head),
            set.messages.base === set.messages.head ? "" : `${set.messages.head - set.messages.base}`
        ]);
    }
    parts.push(table(["", "Base", "Head", "Change"], summaryRows));
    const removed = renderMessages("Removed messages", set.messages?.removed ?? []);
    const added = renderMessages("Added messages", set.messages?.added ?? []);
    if (removed) parts.push(removed);
    if (added) parts.push(added);
    const details = [
        // Markdown is not parsed in <summary>, so it uses HTML
        ["Profile (<code>--profile</code>, one run)", renderProfiles(set.profiles)],
        ["CPU profile of the CLI", renderCpu(set.cpu, "cli")],
        ["CPU profile of the parsers", renderCpu(set.cpu, "parse")],
        ["CPU profile of the kernel with a no-op rule", renderCpu(set.cpu, "traverse")]
    ];
    for (const [title, body] of details) {
        if (body) {
            parts.push(`<details>\n<summary>${title}</summary>\n\n${body}\n\n</details>`);
        }
    }
    return parts.join("\n\n");
};

const renderMarkdown = (result) => {
    const parts = [
        "## Profile and benchmark: base vs head",
        `Base: ${commitLink(REPOSITORY, result.base.commit)}${
            // CI passes the commit itself as the ref, which would only repeat the link
            result.base.ref === result.base.commit ? "" : ` (\`${escapeCell(result.base.ref)}\`)`
        }, head: ${commitLink(REPOSITORY, result.head.commit)}${result.head.dirty ? " with uncommitted changes" : ""}`
    ];
    if (result.sets.length > 1) {
        parts.push(
            table(
                ["Set", "Result", "CLI", "Messages"],
                result.sets.map((set) => [
                    set.name,
                    verdictOf(set),
                    set.time ? fmtRatio(set.time.ratio) : "-",
                    set.messages ? `${set.messages.base} → ${set.messages.head}` : "-"
                ]),
                2
            )
        );
    }
    parts.push(
        `CLI: the median of runs, the base and the head in turns; ${CLI_MARK.slower}x or more is marked slower, ${CLI_MARK.faster}x or less faster. Parsers and traverse: the fastest of runs in one process; ${MICRO_MARK.slower}x and ${MICRO_MARK.faster}x. Times of \`--profile\` and the CPU profiles come from one run and are for reading.`
    );
    for (const set of result.sets) {
        parts.push(renderSet(set));
    }
    return `${parts.join("\n\n")}\n`;
};

// ---------------------------------------------------------------------------
// Main

const main = async () => {
    const { values } = parseArgs({
        options: {
            base: { type: "string" },
            set: { type: "string", default: SET_NAMES.join(",") },
            measure: { type: "string", default: MEASURE_NAMES.join(",") },
            runs: { type: "string" },
            "out-dir": { type: "string", default: path.join(process.cwd(), "compare-result") },
            "cache-dir": {
                type: "string",
                default: path.join(process.env.XDG_CACHE_HOME ?? path.join(os.homedir(), ".cache"), "textlint-compare")
            },
            "no-build": { type: "boolean", default: false },
            render: { type: "string", multiple: true }
        }
    });
    if (values.render) {
        const results = values.render.map((file) => JSON.parse(fs.readFileSync(file, "utf-8")));
        const [first] = results;
        for (const result of results) {
            if (result.base.commit !== first.base.commit || result.head.commit !== first.head.commit) {
                throw new CompareError("The results to render must have the same base and head commits.");
            }
        }
        const order = (a, b) => SET_NAMES.indexOf(a.name) - SET_NAMES.indexOf(b.name);
        const sets = mergeSetResults(results.flatMap((result) => result.sets)).sort(order);
        process.stdout.write(renderMarkdown({ ...first, sets }));
        return;
    }
    const outDir = path.resolve(values["out-dir"]);
    const cacheDir = path.resolve(values["cache-dir"]);
    fs.mkdirSync(outDir, { recursive: true });
    const baseRef = values.base ?? defaultBase();
    const baseCommit = resolveCommit(baseRef);
    const head = {
        commit: git(["rev-parse", "HEAD"]),
        dirty: git(["status", "--porcelain", "--untracked-files=no"]) !== ""
    };
    const sets = loadSets();
    const names = values.set
        .split(",")
        .map((name) => name.trim())
        .filter(Boolean);
    for (const name of names) {
        if (!SET_NAMES.includes(name)) {
            throw new CompareError(`Unknown set: ${name}. Sets: ${SET_NAMES.join(", ")}`);
        }
    }
    const measure = values.measure
        .split(",")
        .map((name) => name.trim())
        .filter(Boolean);
    for (const name of measure) {
        if (!MEASURE_NAMES.includes(name)) {
            throw new CompareError(`Unknown measurement: ${name}. Measurements: ${MEASURE_NAMES.join(", ")}`);
        }
    }
    if (measure.length === 0) {
        throw new CompareError(`Nothing to measure. Measurements: ${MEASURE_NAMES.join(", ")}`);
    }
    // The head build, the base build, and the download of the sets do not depend on each other, so they run at the same time
    const prepareSets = async () => {
        const prepared = [];
        for (const name of names) {
            const set = await prepareSet(name, sets, cacheDir);
            prepared.push(values.runs ? { ...set, runs: Number(values.runs) } : set);
        }
        return prepared;
    };
    // Wait for all of them also when one fails, so each releases its lock of the cache
    const prepared = await Promise.allSettled([
        prepareBase(baseCommit, cacheDir),
        prepareSets(),
        values["no-build"] ? undefined : buildPackages(HEAD_ROOT, "the head")
    ]);
    const failed = prepared.find((entry) => entry.status === "rejected");
    if (failed) {
        throw failed.reason;
    }
    const [baseRoot, preparedSets] = prepared.map((entry) => entry.value);
    const roots = { base: baseRoot, head: HEAD_ROOT };
    const result = {
        base: { ref: baseRef, commit: baseCommit },
        head,
        sets: []
    };
    for (const set of preparedSets) {
        result.sets.push(await compareSet(set, roots, outDir, measure));
    }
    const markdown = renderMarkdown(result);
    fs.writeFileSync(path.join(outDir, "compare.json"), `${JSON.stringify(result, null, 2)}\n`);
    fs.writeFileSync(path.join(outDir, "compare.md"), markdown);
    process.stdout.write(markdown);
    log(`wrote ${path.join(outDir, "compare.md")}, compare.json, and cpuprofiles/`);
};

try {
    await main();
} catch (error) {
    // the commands that still run at the same time as the failed one
    for (const child of children) {
        child.kill();
    }
    if (error instanceof CompareError) {
        process.stderr.write(`[compare] ${error.message}\n`);
        process.exit(2);
    }
    throw error;
}
