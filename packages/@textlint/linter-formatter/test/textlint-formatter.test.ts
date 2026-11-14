// LICENSE : MIT
"use strict";
import path from "node:path";
import { getFormatterList, loadFormatter } from "../src/index.js";
import { createTestMessage } from "./test-helper.js";

import { describe, it } from "vitest";

import * as assert from "node:assert";

describe("@textlint/linter-formatter-test", function () {
    describe("loadFormatter", function () {
        it("should load stylish formatter", async function () {
            const formatterResult = await loadFormatter({
                formatterName: "stylish",
                color: false
            });
            assert.ok(typeof formatterResult.format === "function");
        });

        it("should format output text", async function () {
            const formatterResult = await loadFormatter({
                formatterName: "stylish",
                color: false
            });
            const output = formatterResult.format([
                {
                    filePath: "./myfile.js",
                    messages: [
                        {
                            type: "lint",
                            ruleId: "semi",
                            line: 1,
                            column: 23,
                            index: 0,
                            range: [0, 1],
                            loc: {
                                start: {
                                    line: 1,
                                    column: 23
                                },
                                end: {
                                    line: 1,
                                    column: 24
                                }
                            },
                            message: "Expected a semicolon.",
                            severity: 2
                        }
                    ]
                }
            ]);
            assert.ok(output.length > 0);
        });
    });

    describe("built-in formatters", function () {
        for (const { name } of getFormatterList()) {
            it(`should load ${name} formatter`, async function () {
                const formatter = await loadFormatter({ formatterName: name, color: false });
                const output = formatter.format([
                    {
                        filePath: path.join(__dirname, "fixtures/foo.md"),
                        messages: [createTestMessage({ ruleId: "rule", message: "Message", severity: 2 })]
                    }
                ]);
                assert.ok(output.includes("Message"), output);
            });
        }

        it("should not treat a property of Object as a formatter", async function () {
            await assert.rejects(
                loadFormatter({ formatterName: "constructor" }),
                /Could not find formatter constructor/
            );
            await assert.rejects(loadFormatter({ formatterName: "toString" }), /Could not find formatter toString/);
        });

        it("table formatter should not throw for a message that has a tab character", async function () {
            const formatter = await loadFormatter({ formatterName: "table", color: false });
            const output = formatter.format([
                {
                    filePath: "foo.md",
                    messages: [createTestMessage({ ruleId: "rule", message: "a\tb", severity: 2 })]
                }
            ]);
            assert.ok(output.includes("1 Error"), output);
        });

        it("pretty-error formatter should not output undefined for an empty file", async function () {
            const formatter = await loadFormatter({ formatterName: "pretty-error", color: false });
            const output = formatter.format([
                {
                    filePath: path.join(__dirname, "fixtures/empty.md"),
                    messages: [createTestMessage({ ruleId: "rule", message: "Message", severity: 2 })]
                }
            ]);
            assert.strictEqual(output, "\u2716 1 problem (1 error)\n");
        });
    });

    describe("getFormatterList", function () {
        it("should return list of formatter(s)", function () {
            assert.deepEqual(getFormatterList(), [
                { name: "checkstyle" },
                { name: "compact" },
                { name: "github" },
                { name: "jslint-xml" },
                { name: "json" },
                { name: "junit" },
                { name: "pretty-error" },
                { name: "stylish" },
                { name: "table" },
                { name: "tap" },
                { name: "unix" }
            ]);
        });
    });
});
