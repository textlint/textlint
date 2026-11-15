// In-process benchmark of one build of textlint, used by compare.mjs.
// It measures the parsers, and the kernel with a rule that listens to every node type and does nothing on parsed trees.
// It uses only the built-in modules of Node.js and the packages of the build, so the same file measures any build.
//
// Usage: node micro.mjs --build <root of a built textlint repository> --dir <documents> --mode parse|traverse [--runs <n>]
// Output: JSON on the standard output. Times are in milliseconds.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { parseArgs } from "node:util";

const { values } = parseArgs({
    options: {
        build: { type: "string" },
        dir: { type: "string" },
        mode: { type: "string" },
        runs: { type: "string", default: "5" }
    }
});
if (!values.build || !values.dir || !values.mode) {
    process.stderr.write("Usage: node micro.mjs --build <dir> --dir <documents> --mode parse|traverse [--runs <n>]\n");
    process.exit(2);
}
const runs = Number(values.runs);
const require = createRequire(path.join(path.resolve(values.build), "package.json"));
const load = (name) => require(path.join(path.resolve(values.build), "packages", name));

/**
 * The Markdown files under the directory, in a fixed order
 */
const listMarkdownFiles = (dir) => {
    const files = [];
    const walk = (current) => {
        for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
            if (entry.name === ".git" || entry.name === "node_modules") {
                continue;
            }
            const fullPath = path.join(current, entry.name);
            if (entry.isDirectory()) {
                walk(fullPath);
            } else if (entry.isFile() && entry.name.endsWith(".md")) {
                files.push(fullPath);
            }
        }
    };
    walk(dir);
    return files.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
};

const files = listMarkdownFiles(path.resolve(values.dir)).map((filePath) => ({
    filePath,
    text: fs.readFileSync(filePath, "utf-8")
}));

const stats = (times) => {
    const sorted = [...times].sort((a, b) => a - b);
    return {
        median: sorted[Math.floor(sorted.length / 2)],
        min: sorted[0],
        max: sorted[sorted.length - 1],
        runs: sorted.length
    };
};

// A run repeats the work until it takes at least this long, so a small set is not measured by a few milliseconds
const MIN_RUN_MS = 200;
/**
 * Run `fn` once to warm up, then `runs` times, and return the stats of the runs.
 * Each run calls `fn` as many times as it takes to reach MIN_RUN_MS, and the time of a run is divided by that number.
 */
const bench = async (fn) => {
    const warmupStart = performance.now();
    await fn();
    const repeat = Math.max(1, Math.ceil(MIN_RUN_MS / Math.max(performance.now() - warmupStart, 0.001)));
    const times = [];
    for (let i = 0; i < runs; i++) {
        // start each run with a clean heap, when node runs with --expose-gc
        globalThis.gc?.();
        const start = performance.now();
        for (let j = 0; j < repeat; j++) {
            await fn();
        }
        times.push((performance.now() - start) / repeat);
    }
    return { ...stats(times), repeat };
};

const result = { files: files.length, mode: values.mode };
if (values.mode === "parse") {
    const markdown = load("@textlint/markdown-to-ast");
    const text = load("@textlint/text-to-ast");
    result.parsers = {
        "@textlint/markdown-to-ast": await bench(() => {
            for (const file of files) {
                markdown.parse(file.text);
            }
        }),
        "@textlint/text-to-ast": await bench(() => {
            for (const file of files) {
                text.parse(file.text);
            }
        })
    };
} else if (values.mode === "traverse") {
    const { TextlintKernel } = load("@textlint/kernel");
    const { ASTNodeTypes } = load("@textlint/ast-node-types");
    const markdown = load("@textlint/markdown-to-ast");
    // Parse the documents once, and give the trees to the kernel, so the time does not include parsing
    const asts = new Map(files.map((file) => [file.filePath, markdown.parse(file.text)]));
    class PreparsedProcessor {
        availableExtensions() {
            return [".md"];
        }
        processor() {
            return {
                preProcess: (_text, filePath) => asts.get(filePath),
                postProcess: (messages, filePath) => ({ messages, filePath })
            };
        }
    }
    const plugin = { Processor: PreparsedProcessor };
    // The node types in the trees, including the types that are not in ASTNodeTypes, such as yaml
    const nodeTypes = new Set(Object.values(ASTNodeTypes));
    const collectTypes = (node) => {
        nodeTypes.add(node.type);
        nodeTypes.add(`${node.type}:exit`);
        for (const child of node.children ?? []) {
            collectTypes(child);
        }
    };
    for (const ast of asts.values()) {
        collectTypes(ast);
    }
    // A rule that listens to every node type and its exit, and does nothing
    const noop = () => {
        const listener = () => {};
        const listeners = {};
        for (const type of nodeTypes) {
            listeners[type] = listener;
        }
        return listeners;
    };
    const kernel = new TextlintKernel();
    result.kernel = {
        traverse: await bench(async () => {
            for (const file of files) {
                await kernel.lintText(file.text, {
                    ext: ".md",
                    filePath: file.filePath,
                    plugins: [{ pluginId: "preparsed", plugin }],
                    rules: [{ ruleId: "noop", rule: noop }]
                });
            }
        })
    };
} else {
    process.stderr.write(`Unknown mode: ${values.mode}\n`);
    process.exit(2);
}
process.stdout.write(`${JSON.stringify(result)}\n`);
