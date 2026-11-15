// LICENSE : MIT
import * as assert from "node:assert";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, it } from "vitest";
import { profiler } from "@textlint/kernel";
import { cli } from "../../src/cli.js";
import { Logger } from "../../src/util/logger.js";

const ruleDir = path.join(__dirname, "fixtures/rules");
const targetFile = path.join(__dirname, "fixtures/todo.md");

describe("cli --profile", () => {
    const originLog = Logger.log;
    const originWrite = Logger.write;
    const originError = Logger.error;
    let output: string[] = [];
    let errors: string[] = [];
    beforeEach(() => {
        output = [];
        errors = [];
        Logger.error = (...message: unknown[]) => {
            errors.push(message.join(" "));
        };
        Logger.log = (...message: unknown[]) => {
            output.push(message.join(" "));
        };
        Logger.write = (message: string) => {
            output.push(message);
        };
    });
    afterEach(() => {
        Logger.log = originLog;
        Logger.write = originWrite;
        Logger.error = originError;
    });

    it("prints the summary as Markdown instead of the results", async () => {
        const exitStatus = await cli.execute(`--profile --rulesdir ${ruleDir} ${targetFile}`);
        // the exit status is the one of the run without --profile: todo.md has errors
        assert.strictEqual(exitStatus, 1);
        assert.strictEqual(output.length, 1);
        const [summary] = output;
        assert.match(summary, /^## textlint profile/);
        assert.match(summary, /, 1 file\n/);
        for (const phase of [
            "startup",
            "load-config",
            "search-files",
            "lint",
            "↳ parse",
            "↳ traverse",
            "↳ rules",
            "format"
        ]) {
            assert.ok(summary.includes(`| ${phase} |`), `phase ${phase} in\n${summary}`);
        }
        assert.ok(summary.includes("| @textlint/textlint-plugin-markdown |"), summary);
        assert.ok(summary.includes("| no-todo |"), summary);
        assert.ok(summary.includes("| fixtures/todo.md |") || summary.includes("todo.md |"), summary);
        // the results of the stylish formatter are not printed
        assert.ok(!summary.includes("problem"), summary);
        // the profiler is disabled and cleared after the run
        assert.strictEqual(profiler.enabled, false);
        assert.deepStrictEqual(profiler.getEntries(), []);
    });

    it("prints JSON with --format json", async () => {
        await cli.execute(`--profile --format json --rulesdir ${ruleDir} ${targetFile}`);
        assert.strictEqual(output.length, 1);
        const report = JSON.parse(output[0]);
        assert.deepStrictEqual(Object.keys(report), ["total", "files", "phases", "parsers", "rules", "slowestFiles"]);
        assert.strictEqual(report.files, 1);
        assert.ok(report.total > 0);
        const rule = report.rules.find((rule: { id: string }) => rule.id === "no-todo");
        assert.ok(rule, JSON.stringify(report.rules));
        assert.strictEqual(rule.type, "rule");
        assert.ok(rule.count > 0);
        const parse = report.phases.find((phase: { name: string }) => phase.name === "parse");
        assert.deepStrictEqual([parse.depth, parse.count], [1, 1]);
    });

    it("writes the results to --output-file and the summary to the standard output", async () => {
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), "textlint-profile-"));
        try {
            const outputFile = path.join(dir, "result.json");
            await cli.execute(
                `--profile --format json --output-file ${outputFile} --rulesdir ${ruleDir} ${targetFile}`
            );
            const results = JSON.parse(fs.readFileSync(outputFile, "utf-8"));
            assert.strictEqual(results[0].messages.length > 0, true);
            assert.strictEqual(output.length, 1);
            assert.ok("phases" in JSON.parse(output[0]));
        } finally {
            fs.rmSync(dir, { recursive: true, force: true });
        }
    });

    it("profiles --fix --dry-run with the fix phases", async () => {
        const fixerRuleDir = path.join(__dirname, "fixtures/fixer-rules");
        const input = path.join(__dirname, "fixtures/fixer-rules/input.md");
        await cli.execute(`--profile --fix --dry-run --format json --rulesdir ${fixerRuleDir} ${input}`);
        const report = JSON.parse(output[0]);
        const names = report.phases.map((phase: { name: string }) => phase.name);
        assert.ok(names.includes("fix"), names.join(","));
        assert.ok(names.includes("apply-fixes"), names.join(","));
        assert.ok(!names.includes("write-files"), names.join(","));
    });

    it("prints the warning of no rules to the standard error, and only JSON to the standard output", async () => {
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), "textlint-profile-"));
        try {
            const config = path.join(dir, ".textlintrc.json");
            fs.writeFileSync(config, JSON.stringify({ rules: {} }));
            const exitStatus = await cli.execute(`--profile --format json --config ${config} ${targetFile}`);
            assert.strictEqual(exitStatus, 1);
            assert.strictEqual(output.length, 1);
            assert.ok("phases" in JSON.parse(output[0]));
            assert.match(errors.join("\n"), /No rules found/);
        } finally {
            fs.rmSync(dir, { recursive: true, force: true });
        }
    });

    it("does not count the files that --cache skips", async () => {
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), "textlint-profile-"));
        try {
            const file = path.join(dir, "ok.md");
            fs.writeFileSync(file, "This is a text.\n");
            const cacheLocation = path.join(dir, ".textlintcache");
            const args = `--profile --format json --cache --cache-location ${cacheLocation} --cache-strategy content --rule textlint-rule-no-todo ${file}`;
            await cli.execute(args);
            assert.strictEqual(JSON.parse(output[0]).files, 1);
            output = [];
            await cli.execute(args);
            assert.strictEqual(JSON.parse(output[0]).files, 0);
        } finally {
            fs.rmSync(dir, { recursive: true, force: true });
        }
    });

    it("prints the results and records nothing without --profile", async () => {
        await cli.execute(`--rulesdir ${ruleDir} ${targetFile}`);
        assert.ok(!output.join("").includes("textlint profile"));
        assert.deepStrictEqual(profiler.getEntries(), []);
    });
});
