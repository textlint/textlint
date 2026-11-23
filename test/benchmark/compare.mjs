// Compare two builds of textlint, the base and the head, on fixed sets of documents.
// See docs/products/textlint/features/change-comparison/
//
// Usage: pnpm run compare [--base <ref>] [--set small,medium,large,huge] [--runs <n>] [--out-dir <dir>]
//                         [--cache-dir <dir>] [--no-build] [--render <compare.json>]...
//
// It uses only the built-in modules of Node.js, so it runs on a fresh checkout and compares any two commits.
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";

const HEAD_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const BENCHMARK_DIR = path.join(HEAD_ROOT, "test/benchmark");
const CONFIG_FILE = path.join(BENCHMARK_DIR, ".textlintrc.jtf-style.json");
const SET_NAMES = ["small", "medium", "large", "huge"];
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
// The pause of garbage collection of the CLI: a run with a few collections changes more between runs
const GC_MARK = { slower: 1.3, faster: 0.77 };
const MIN_MARKED_GC_MS = 10;

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
const log = (message) => process.stderr.write(`[compare] ${message}\n`);
const git = (args, cwd = HEAD_ROOT) => run("git", args, { cwd }).stdout.trim();
const hasCommand = (command) => spawnSync(command, ["--version"], { stdio: "ignore" }).status === 0;

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
const withLock = (entry, fn) => {
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
        return fn();
    } finally {
        fs.rmSync(lock, { recursive: true, force: true });
    }
};

const buildPackages = (root, label) => {
    log(`building ${label}`);
    run("pnpm", ["--filter", "./packages/**", "run", "build"], { cwd: root, label: `the build of ${label}` });
};

const prepareBase = (commit, cacheDir) => {
    const dir = path.join(cacheDir, `base-${commit}`);
    const marker = path.join(dir, ".compare-built");
    if (fs.existsSync(marker)) {
        return dir;
    }
    return withLock(dir, () => {
        if (fs.existsSync(marker)) {
            return dir;
        }
        if (fs.existsSync(dir)) {
            spawnSync("git", ["worktree", "remove", "--force", dir], { cwd: HEAD_ROOT, stdio: "ignore" });
            fs.rmSync(dir, { recursive: true, force: true });
        }
        spawnSync("git", ["worktree", "prune"], { cwd: HEAD_ROOT, stdio: "ignore" });
        log(`creating a worktree of the base ${commit.slice(0, 12)}`);
        git(["worktree", "add", "--detach", dir, commit]);
        log("installing the dependencies of the base");
        run("pnpm", ["install", "--frozen-lockfile"], { cwd: dir, label: "pnpm install of the base" });
        buildPackages(dir, "the base");
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

const prepareSet = (name, sets, cacheDir) => {
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
        withLock(dir, () => {
            if (fs.existsSync(marker)) {
                return;
            }
            fs.rmSync(dir, { recursive: true, force: true });
            fs.mkdirSync(dir, { recursive: true });
            log(`downloading ${set.repository} ${set.commit.slice(0, 12)} (${set.path})`);
            git(["init", "--quiet"], dir);
            git(["remote", "add", "origin", set.repository], dir);
            git(["sparse-checkout", "set", "--no-cone", `/${set.path}/**`], dir);
            git(["fetch", "--quiet", "--depth", "1", "--filter=blob:none", "origin", set.commit], dir);
            git(["checkout", "--quiet", "FETCH_HEAD"], dir);
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
const lintOnce = (root, set, label, tmpDir) => {
    const resultsFile = path.join(tmpDir, `results-${label}.json`);
    const withProfile = supportsProfile(root);
    const args = [...cliArgs(root, set), "--format", "json", "--output-file", resultsFile];
    if (withProfile) {
        args.push("--profile");
    }
    // 0: no error, 1: errors are found
    const result = run(process.execPath, args, { cwd: set.dir, okStatuses: [0, 1], label: `the lint of ${label}` });
    const results = JSON.parse(fs.readFileSync(resultsFile, "utf-8"));
    return {
        results,
        profile: withProfile ? JSON.parse(result.stdout) : null
    };
};

const cpuProfile = (args, name, label, set, outDir) => {
    const dir = path.join(outDir, "cpuprofiles");
    fs.mkdirSync(dir, { recursive: true });
    const fileName = `${set.name}-${label}-${name}.cpuprofile`;
    const result = run(process.execPath, ["--cpu-prof", "--cpu-prof-dir", dir, "--cpu-prof-name", fileName, ...args], {
        cwd: set.dir,
        okStatuses: [0, 1],
        label: `the ${name} run of ${label}`
    });
    return { file: path.join(dir, fileName), stdout: result.stdout };
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
 * so a change of the machine during the measurement affects both builds.
 * The measuring processes do not record a CPU profile, because the sampling adds noise;
 * one more process for each build records it.
 */
const microBench = (roots, set, mode, outDir) => {
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
    const cpuProfiles = {};
    for (const label of ["base", "head"]) {
        cpuProfiles[label] = cpuProfile(
            ["--expose-gc", ...microArgs(roots[label], set, mode, 1)],
            mode,
            label,
            set,
            outDir
        ).file;
    }
    return {
        base: mergeMicroResults(results.base, mode),
        head: mergeMicroResults(results.head, mode),
        cpuProfiles
    };
};

const shellQuote = (value) => `'${String(value).replace(/'/g, `'\\''`)}'`;

const measureCliTime = (roots, set, tmpDir, runs) => {
    if (!hasCommand("hyperfine")) {
        return null;
    }
    const exportFile = path.join(tmpDir, "time.json");
    const commands = ["base", "head"].map((label) =>
        [process.execPath, ...cliArgs(roots[label], set), "--format", "json", "--output-file", "/dev/null"]
            .map(shellQuote)
            .join(" ")
    );
    log(`measuring the run time of the CLI on ${set.name} (${runs} runs of each build)`);
    run(
        "hyperfine",
        ["--ignore-failure", "--warmup", "1", "--runs", String(runs), "--export-json", exportFile, ...commands],
        {
            cwd: set.dir,
            label: "hyperfine"
        }
    );
    const [base, head] = JSON.parse(fs.readFileSync(exportFile, "utf-8")).results.map((result) => {
        // hyperfine 1.x has the numbers at the top level, and 2.x in summary.time_wall_clock
        const wallClock = result.summary?.time_wall_clock ?? { ...result, count: result.times?.length };
        return {
            median: wallClock.median * 1000,
            mean: wallClock.mean * 1000,
            stddev: (wallClock.stddev ?? 0) * 1000,
            runs: wallClock.count ?? runs
        };
    });
    return withRatio(base, head, CLI_MARK);
};

/**
 * Measure the pause of garbage collection of the CLI: the base and the head in turns, each run in a new process
 * that loads gc-observer.cjs. The run with the median pause stands for a build.
 * The run time of the CLI does not show it: a pause is a few percent of a run, less than the noise of the run time.
 */
const measureGc = (roots, set, tmpDir, runs) => {
    log(`measuring the garbage collection of the CLI on ${set.name} (${runs} runs of each build)`);
    const outputFile = path.join(tmpDir, "gc.json");
    const results = { base: [], head: [] };
    for (let i = 0; i < runs; i++) {
        for (const label of ["base", "head"]) {
            fs.rmSync(outputFile, { force: true });
            run(
                process.execPath,
                [
                    "--require",
                    path.join(BENCHMARK_DIR, "gc-observer.cjs"),
                    ...cliArgs(roots[label], set),
                    "--format",
                    "json",
                    "--output-file",
                    "/dev/null"
                ],
                {
                    cwd: set.dir,
                    okStatuses: [0, 1],
                    label: `the garbage collection run of ${label}`,
                    env: { GC_OBSERVER_OUTPUT: outputFile }
                }
            );
            results[label].push(JSON.parse(fs.readFileSync(outputFile, "utf-8")));
        }
    }
    const summarize = (stats) => {
        const sorted = [...stats].sort((a, b) => a.total.time - b.total.time);
        const median = sorted[Math.floor(sorted.length / 2)];
        return {
            median: median.total.time,
            min: sorted[0].total.time,
            max: sorted[sorted.length - 1].total.time,
            runs: sorted.length,
            // of the run with the median pause
            minor: median.minor,
            major: median.major
        };
    };
    return withRatio(summarize(results.base), summarize(results.head), GC_MARK, "median", MIN_MARKED_GC_MS);
};

/**
 * Fix the set without writing the files (`--fix --dry-run`): the base and the head in turns, each run in a new process.
 * The first run of a build writes its results, and they are compared by the fixed text of each file.
 * A lint does not show this path: to fix, the kernel runs the fixable rules one after another on the text
 * that the rules before fixed, and applies their fixes.
 */
const measureFix = (roots, set, tmpDir, runs) => {
    log(`measuring the run time of the CLI with --fix --dry-run on ${set.name} (${runs} runs of each build)`);
    const times = { base: [], head: [] };
    const outputs = {};
    for (let i = 0; i < runs; i++) {
        for (const label of ["base", "head"]) {
            const resultsFile = i === 0 ? path.join(tmpDir, `fix-${label}.json`) : "/dev/null";
            const start = performance.now();
            run(
                process.execPath,
                [...cliArgs(roots[label], set), "--fix", "--dry-run", "--format", "json", "--output-file", resultsFile],
                { cwd: set.dir, label: `the fix of ${label}` }
            );
            times[label].push(performance.now() - start);
            if (i === 0) {
                outputs[label] = fixedTexts(JSON.parse(fs.readFileSync(resultsFile, "utf-8")), set.dir);
                fs.rmSync(resultsFile, { force: true });
            }
        }
    }
    const summarize = (values) => {
        const sorted = [...values].sort((a, b) => a - b);
        return {
            median: sorted[Math.floor(sorted.length / 2)],
            min: sorted[0],
            max: sorted[sorted.length - 1],
            runs: sorted.length
        };
    };
    const files = [...new Set([...outputs.base.keys(), ...outputs.head.keys()])].sort((a, b) =>
        a < b ? -1 : a > b ? 1 : 0
    );
    return {
        ...withRatio(summarize(times.base), summarize(times.head), CLI_MARK),
        fixedFiles: { base: countFixed(outputs.base), head: countFixed(outputs.head) },
        changedFiles: files.filter((file) => outputs.base.get(file)?.hash !== outputs.head.get(file)?.hash)
    };
};
/**
 * The fixed text of each file of the results of `--fix`, as a hash, and if a fix was applied to the file.
 * The results of a large set have the text of every file, so only the hashes are kept.
 */
const fixedTexts = (results, dir) =>
    new Map(
        results.map((result) => [
            path.relative(dir, result.filePath).split(path.sep).join("/"),
            {
                hash: crypto.createHash("sha256").update(result.output).digest("hex"),
                fixed: result.applyingMessages.length > 0
            }
        ])
    );
const countFixed = (outputs) => [...outputs.values()].filter((output) => output.fixed).length;

/**
 * The ratio of the head to the base, and its mark.
 * `key` is the statistic to compare: the median for the CLI, and the minimum for the in-process benchmarks,
 * because noise of a machine only makes a run slower.
 */
const withRatio = (base, head, marks, key = "median", minMarked = MIN_MARKED_MS) => {
    const ratio = base[key] > 0 ? head[key] / base[key] : 1;
    // a time below `minMarked` is too short to tell a change from noise
    const measurable = Math.max(base[key], head[key]) >= minMarked;
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

const compareSet = (set, roots, outDir) => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "textlint-compare-"));
    try {
        log(`linting ${set.name} with the base and the head`);
        const lint = {
            base: lintOnce(roots.base, set, "base", tmpDir),
            head: lintOnce(roots.head, set, "head", tmpDir)
        };
        const messages = {
            base: flattenResults(lint.base.results, set.dir),
            head: flattenResults(lint.head.results, set.dir)
        };
        const micro = {};
        const cpu = { base: {}, head: {} };
        for (const mode of ["parse", "traverse"]) {
            log(`measuring ${mode} on ${set.name}`);
            const { base, head, cpuProfiles } = microBench(roots, set, mode, outDir);
            micro[mode] = { base, head };
            cpu.base[mode] = summarizeCpuProfile(cpuProfiles.base, roots.base);
            cpu.head[mode] = summarizeCpuProfile(cpuProfiles.head, roots.head);
        }
        for (const label of ["base", "head"]) {
            log(`recording a CPU profile of the CLI of the ${label} on ${set.name}`);
            const { file } = cpuProfile(
                [...cliArgs(roots[label], set), "--format", "json", "--output-file", "/dev/null"],
                "cli",
                label,
                set,
                outDir
            );
            cpu[label].cli = summarizeCpuProfile(file, roots[label]);
        }
        const parsers = Object.keys(micro.parse.head.parsers).map((id) => ({
            id,
            ...withRatio(micro.parse.base.parsers[id], micro.parse.head.parsers[id], MICRO_MARK, "min")
        }));
        const traverse = withRatio(
            micro.traverse.base.kernel.traverse,
            micro.traverse.head.kernel.traverse,
            MICRO_MARK,
            "min"
        );
        return {
            name: set.name,
            repository: set.repository,
            commit: set.commit,
            label: set.label,
            files: countMarkdownFiles(set.dir),
            messages: {
                base: messages.base.length,
                head: messages.head.length,
                ...diffMessages(messages.base, messages.head)
            },
            time: measureCliTime(roots, set, tmpDir, set.runs),
            gc: measureGc(roots, set, tmpDir, set.runs),
            fix: measureFix(roots, set, tmpDir, set.runs),
            parsers,
            traverse,
            profiles: { base: lint.base.profile, head: lint.head.profile },
            cpu
        };
    } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    }
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

// a pause is longer or shorter, and a longer pause is the one to look at
const GC_MARK_TEXT = { slower: "longer", faster: "shorter" };
const gcMarkText = (mark) => (mark === "slower" ? " ⚠️ longer" : mark === "faster" ? " shorter" : "");
const fmtGc = (stats) => `${fmt(stats.median)} (${stats.minor.count} minor, ${stats.major.count} major)`;

/**
 * What changed in a set, for the verdict.
 * `warn` is true for a change to look at: other lint results, or a slower time or a longer pause.
 */
const changesOf = (set) => {
    const changes = [];
    if (set.messages.added.length > 0 || set.messages.removed.length > 0) {
        changes.push({
            text: `lint results (+${set.messages.added.length} −${set.messages.removed.length})`,
            warn: true
        });
    }
    for (const parser of set.parsers) {
        if (parser.mark) {
            changes.push({
                text: `${parser.id} ${parser.mark} (${fmtRatio(parser.ratio)})`,
                warn: parser.mark === "slower"
            });
        }
    }
    if (set.traverse.mark) {
        changes.push({
            text: `traverse ${set.traverse.mark} (${fmtRatio(set.traverse.ratio)})`,
            warn: set.traverse.mark === "slower"
        });
    }
    if (set.time?.mark) {
        changes.push({ text: `CLI ${set.time.mark} (${fmtRatio(set.time.ratio)})`, warn: set.time.mark === "slower" });
    }
    if (set.gc?.mark) {
        changes.push({
            text: `GC pause ${GC_MARK_TEXT[set.gc.mark]} (${fmtRatio(set.gc.ratio)})`,
            warn: set.gc.mark === "slower"
        });
    }
    if (set.fix?.changedFiles.length > 0) {
        changes.push({ text: `fixed text (${set.fix.changedFiles.length} files)`, warn: true });
    }
    if (set.fix?.mark) {
        changes.push({
            text: `CLI with --fix ${set.fix.mark} (${fmtRatio(set.fix.ratio)})`,
            warn: set.fix.mark === "slower"
        });
    }
    return changes;
};
const verdictOf = (set) => {
    const changes = changesOf(set);
    if (changes.length === 0) {
        return `✅ No change in lint results${set.time ? `, CLI ${fmtRatio(set.time.ratio)}` : ""}`;
    }
    const list = changes.map((change) => change.text).join(", ");
    // only faster times and shorter pauses: not a warning
    return changes.some((change) => change.warn) ? `⚠️ Changed: ${list}` : `✅ Improved: ${list}`;
};

const renderProfiles = (profiles) => {
    const { base, head } = profiles;
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
    const summaryRows = [
        set.time
            ? [
                  "CLI run time (median, ms)",
                  fmt(set.time.base.median),
                  fmt(set.time.head.median),
                  `${fmtRatio(set.time.ratio)}${markText(set.time.mark)}`
              ]
            : ["CLI run time (median, ms)", "-", "-", "not measured: hyperfine is not installed"],
        // a result of a version before the garbage collection was measured has no `gc`
        ...(set.gc
            ? [
                  [
                      "GC pause of the CLI (median, ms)",
                      fmtGc(set.gc.base),
                      fmtGc(set.gc.head),
                      `${fmtRatio(set.gc.ratio)}${gcMarkText(set.gc.mark)}`
                  ]
              ]
            : []),
        // a result of a version before `--fix` was measured has no `fix`
        ...(set.fix
            ? [
                  [
                      "CLI run time with `--fix --dry-run` (median, ms)",
                      fmt(set.fix.base.median),
                      fmt(set.fix.head.median),
                      `${fmtRatio(set.fix.ratio)}${markText(set.fix.mark)}`
                  ]
              ]
            : []),
        ...set.parsers.map((parser) => [
            `parse: ${parser.id} (min, ms)`,
            fmt(parser.base.min),
            fmt(parser.head.min),
            `${fmtRatio(parser.ratio)}${markText(parser.mark)}`
        ]),
        [
            "traverse + dispatch with a no-op rule (min, ms)",
            fmt(set.traverse.base.min),
            fmt(set.traverse.head.min),
            `${fmtRatio(set.traverse.ratio)}${markText(set.traverse.mark)}`
        ],
        [
            "messages",
            String(set.messages.base),
            String(set.messages.head),
            set.messages.base === set.messages.head ? "" : `${set.messages.head - set.messages.base}`
        ],
        ...(set.fix
            ? [
                  [
                      "files fixed by `--fix`",
                      String(set.fix.fixedFiles.base),
                      String(set.fix.fixedFiles.head),
                      set.fix.changedFiles.length === 0
                          ? ""
                          : `⚠️ ${set.fix.changedFiles.length} files with another fixed text`
                  ]
              ]
            : [])
    ];
    parts.push(table(["", "Base", "Head", "Change"], summaryRows));
    const removed = renderMessages("Removed messages", set.messages.removed);
    const added = renderMessages("Added messages", set.messages.added);
    if (removed) parts.push(removed);
    if (added) parts.push(added);
    if (set.fix?.changedFiles.length > 0) {
        const files = set.fix.changedFiles.slice(0, MAX_ROWS).map((file) => `- \`${escapeCell(file)}\``);
        const more =
            set.fix.changedFiles.length > MAX_ROWS
                ? `\n\n${set.fix.changedFiles.length - MAX_ROWS} more in the JSON output.`
                : "";
        parts.push(`Files with another fixed text (${set.fix.changedFiles.length}):\n\n${files.join("\n")}${more}`);
    }
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
                    `${set.messages.base} → ${set.messages.head}`
                ]),
                2
            )
        );
    }
    parts.push(
        `CLI, and CLI with \`--fix --dry-run\`: the median of runs; ${CLI_MARK.slower}x or more is marked slower, ${CLI_MARK.faster}x or less faster. Parsers and traverse: the fastest of runs in one process; ${MICRO_MARK.slower}x and ${MICRO_MARK.faster}x. GC pause: the garbage collections of one run of the CLI, the median of runs; ${GC_MARK.slower}x or more is marked longer, ${GC_MARK.faster}x or less shorter, from ${MIN_MARKED_GC_MS} ms. Times of \`--profile\` and the CPU profiles come from one run and are for reading.`
    );
    for (const set of result.sets) {
        parts.push(renderSet(set));
    }
    return `${parts.join("\n\n")}\n`;
};

// ---------------------------------------------------------------------------
// Main

const main = () => {
    const { values } = parseArgs({
        options: {
            base: { type: "string" },
            set: { type: "string", default: SET_NAMES.join(",") },
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
        process.stdout.write(renderMarkdown({ ...first, sets: results.flatMap((result) => result.sets).sort(order) }));
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
    if (!values["no-build"]) {
        buildPackages(HEAD_ROOT, "the head");
    }
    const roots = { base: prepareBase(baseCommit, cacheDir), head: HEAD_ROOT };
    const preparedSets = names.map((name) => {
        const set = prepareSet(name, sets, cacheDir);
        return values.runs ? { ...set, runs: Number(values.runs) } : set;
    });
    const result = {
        base: { ref: baseRef, commit: baseCommit },
        head,
        sets: preparedSets.map((set) => compareSet(set, roots, outDir))
    };
    const markdown = renderMarkdown(result);
    fs.writeFileSync(path.join(outDir, "compare.json"), `${JSON.stringify(result, null, 2)}\n`);
    fs.writeFileSync(path.join(outDir, "compare.md"), markdown);
    process.stdout.write(markdown);
    log(`wrote ${path.join(outDir, "compare.md")}, compare.json, and cpuprofiles/`);
};

try {
    main();
} catch (error) {
    if (error instanceof CompareError) {
        process.stderr.write(`[compare] ${error.message}\n`);
        process.exit(2);
    }
    throw error;
}
