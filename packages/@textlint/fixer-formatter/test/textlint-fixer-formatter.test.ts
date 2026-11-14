// LICENSE : MIT
"use strict";
import assert from "node:assert";
import { describe, it } from "vitest";
import path from "node:path";
import type { TextlintFixResult } from "@textlint/types";
import { getFixerFormatterList, loadFormatter } from "../src/index.js";

describe("@textlint/fixer-formatter-test", function () {
    describe("built-in formatters", function () {
        const message = {
            type: "lint" as const,
            ruleId: "rule",
            message: "Message",
            line: 1,
            column: 1,
            index: 0,
            range: [0, 1] as const,
            loc: { start: { line: 1, column: 1 }, end: { line: 1, column: 1 } },
            severity: 2
        };
        const results: TextlintFixResult[] = [
            {
                filePath: path.join(__dirname, "fixtures/single.md"),
                output: "Fixed output",
                messages: [message],
                applyingMessages: [message],
                remainingMessages: []
            }
        ];
        for (const { name } of getFixerFormatterList()) {
            it(`should load ${name} formatter`, async function () {
                const formatter = await loadFormatter({ formatterName: name, color: false });
                const output = formatter.format(results);
                assert.ok(typeof output === "string" && output.length > 0, output);
            });
        }

        it("diff formatter should read the file when getSource is not given", async function () {
            const formatter = await loadFormatter({ formatterName: "diff", color: false });
            const output = formatter.format(results);
            assert.ok(output.includes("+ Fixed output"), output);
        });

        it("diff formatter should prefer the content from getSource over the file", async function () {
            const formatter = await loadFormatter({
                formatterName: "diff",
                color: false,
                getSource: () => "in-memory text\n"
            });
            const output = formatter.format(results);
            assert.ok(output.includes("- in-memory text"), output);
        });

        it("should not treat a property of Object as a formatter", async function () {
            await assert.rejects(
                loadFormatter({ formatterName: "constructor" }),
                /Could not find formatter constructor/
            );
        });
    });

    describe("getFormatterList", function () {
        it("should return list of formatter(s)", function () {
            assert.deepStrictEqual(getFixerFormatterList(), [
                { name: "compats" },
                { name: "diff" },
                { name: "fixed-result" },
                { name: "json" },
                { name: "stylish" }
            ]);
        });
    });
});
