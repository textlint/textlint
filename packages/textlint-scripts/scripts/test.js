// LICENSE : MIT
"use strict";
process.env.NODE_ENV = "test";
const spawn = require("cross-spawn");
const fs = require("fs");
const args = process.argv.slice(2);
const paths = require("../configs/paths");
const useTypeScript = fs.existsSync(paths.appTsConfig);

const run = (command, commandArgs) => {
    const result = spawn.sync(command, commandArgs, { stdio: "inherit" });
    if (result.error) {
        console.error(result.error);
        return 1;
    }
    return result.status ?? 1;
};

// Mocha config files are not read anymore
const mochaConfigFiles = [
    ".mocharc.js",
    ".mocharc.cjs",
    ".mocharc.yaml",
    ".mocharc.yml",
    ".mocharc.jsonc",
    ".mocharc.json",
    "test/mocha.opts"
].filter((file) => fs.existsSync(file));
if (mochaConfigFiles.length > 0) {
    console.warn(
        `textlint-scripts test runs tests with node:test and does not read ${mochaConfigFiles.join(", ")}.
Pass options to node:test as arguments instead. For example, "textlint-scripts test --test-timeout=20000".`
    );
}

// Fail when there are no test files, like Mocha
const testFilePattern = useTypeScript ? "test/**/*.{js,ts}" : "test/**/*.js";
const testExtensions = useTypeScript ? [".js", ".ts"] : [".js"];
const hasTestFiles =
    fs.existsSync("test") &&
    fs
        .readdirSync("test", { recursive: true })
        .some((file) => testExtensions.some((extension) => String(file).endsWith(extension)));
if (!hasTestFiles) {
    console.error(`Error: No test files found: "${testFilePattern}"`);
    process.exit(1);
}

// tsc type-check
if (useTypeScript) {
    const tscStatus = run("tsc", ["-p", paths.appTsConfig]);
    if (tscStatus !== 0) {
        process.exit(tscStatus);
    }
}

// node:test
// - babel-register transpiles test and source files on the fly
// - node-test-globals defines Mocha-style globals like `describe` and `it`
const hasOption = (name) => args.some((arg) => arg === name || arg.startsWith(`${name}=`));
const nodeArgs = [
    "--require",
    require.resolve("../configs/babel-register"),
    "--require",
    require.resolve("../configs/node-test-globals"),
    "--test",
    ...(hasOption("--test-timeout") ? [] : ["--test-timeout=10000"]),
    ...(hasOption("--test-reporter") ? [] : ["--test-reporter=spec"]),
    // Node.js stops parsing options at the first file path, so user arguments go before the default pattern
    ...args,
    testFilePattern
];
process.exit(run(process.execPath, nodeArgs));
