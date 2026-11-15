// LICENSE : MIT
import * as assert from "node:assert";
import * as path from "node:path";
import { describe, it } from "vitest";
import type { TextlintProfileEntry } from "@textlint/kernel";
import {
    createProfileReport,
    formatProfileReportAsJSON,
    formatProfileReportAsMarkdown
} from "../../src/profile/profile-report.js";

const entry = (type: string, id: string | undefined, total: number, count = 1): TextlintProfileEntry => ({
    type,
    id,
    total,
    count,
    max: total
});
const cwd = path.resolve("/project");

describe("profile-report", () => {
    it("orders phases as a run and sums the totals of a phase", () => {
        const report = createProfileReport(
            [
                entry("format", undefined, 5),
                entry("rule", "b", 30, 10),
                entry("rule", "a", 10, 4),
                entry("parse", "markdown", 20, 2),
                entry("parse", "text", 2, 1),
                entry("lint", undefined, 80),
                entry("startup", undefined, 100)
            ],
            { total: 200, files: 3 }
        );
        assert.deepStrictEqual(
            report.phases.map((phase) => [phase.name, phase.depth, phase.time, phase.count]),
            [
                ["startup", 0, 100, 1],
                ["lint", 0, 80, 1],
                ["parse", 1, 22, 3],
                ["rules", 1, 40, 14],
                ["format", 0, 5, 1]
            ]
        );
        assert.strictEqual(report.phases[0].percent, 50);
        assert.deepStrictEqual(
            report.rules.map((rule) => rule.id),
            ["b", "a"]
        );
        assert.deepStrictEqual(
            report.parsers.map((parser) => [parser.id, parser.time, parser.count]),
            [
                ["markdown", 20, 2],
                ["text", 2, 1]
            ]
        );
    });

    it("keeps the 10 slowest files", () => {
        const files = Array.from({ length: 12 }, (_, index) => entry("file", path.join(cwd, `${index}.md`), index));
        const report = createProfileReport(files, { total: 100, files: 12 });
        assert.strictEqual(report.slowestFiles.length, 10);
        assert.strictEqual(report.slowestFiles[0].time, 11);
    });

    it("shows the top 10 rules in Markdown and all rules in JSON", () => {
        const rules = Array.from({ length: 12 }, (_, index) => entry("rule", `rule-${index}`, index));
        const report = createProfileReport(rules, { total: 100, files: 1 });
        const markdown = formatProfileReportAsMarkdown(report, { cwd });
        assert.ok(markdown.includes("| rule-11 |"));
        assert.ok(!markdown.includes("| rule-1 |"));
        assert.ok(markdown.includes("2 more rules are in the JSON output"));
        assert.strictEqual(JSON.parse(formatProfileReportAsJSON(report, { cwd })).rules.length, 12);
    });

    it("escapes file paths and ids for a Markdown table and a terminal", () => {
        const report = createProfileReport(
            [entry("rule", "a|b", 1), entry("file", path.join(cwd, "x\u001b[31m|y.md"), 1)],
            { total: 10, files: 1 }
        );
        const markdown = formatProfileReportAsMarkdown(report, { cwd });
        assert.ok(markdown.includes("| a\\|b |"), markdown);
        assert.ok(markdown.includes("| x[31m\\|y.md |"), markdown);
        assert.ok(!markdown.includes("\u001b"));
    });

    it("shows file paths relative to cwd", () => {
        const report = createProfileReport([entry("file", path.join(cwd, "docs/a.md"), 1)], { total: 10, files: 1 });
        const json = JSON.parse(formatProfileReportAsJSON(report, { cwd }));
        assert.strictEqual(json.slowestFiles[0].filePath, path.join("docs", "a.md"));
    });
});
