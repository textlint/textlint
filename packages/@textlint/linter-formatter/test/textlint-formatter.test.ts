// LICENSE : MIT
"use strict";
import { getFormatterList, loadFormatter, resolveFormatter } from "../src/index.js";

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

    describe("resolveFormatter", function () {
        it("should resolve built-in formatters", function () {
            assert.strictEqual(resolveFormatter("stylish"), "stylish");
            assert.strictEqual(resolveFormatter("pretty-error"), "pretty-error");
        });

        it("should return null for unavailable formatter", function () {
            assert.strictEqual(resolveFormatter("unavailable-formatter"), null);
        });
    });
});
