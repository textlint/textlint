// LICENSE : MIT
"use strict";
import { createFormatter, getFormatterList } from "textlint-formatter";

import * as path from "path";
import * as assert from "assert";

describe("textlint-formatter-test", function() {
    describe("createFormatter", function() {
        it("should return formatter function", function() {
            const formatter = createFormatter({
                formatterName: "stylish"
            });
            assert(typeof formatter === "function");
        });
        context("formatter", function() {
            it("should return output text", function() {
                const formatter = createFormatter({
                    formatterName: "stylish"
                });
                const output = formatter([
                    {
                        filePath: "./myfile.js",
                        messages: [
                            {
                                type: "lint",
                                ruleId: "semi",
                                line: 1,
                                column: 23,
                                index: 0,
                                message: "Expected a semicolon.",
                                severity: 2
                            }
                        ]
                    }
                ]);
                assert(output.length > 0);
            });
        });
        it("run all formatter", function() {
            const formatterNames = [
                "checkstyle",
                "compact",
                "jslint-xml",
                "junit",
                "pretty-error",
                "stylish",
                "tap",
                "json"
            ];
            formatterNames.forEach(function(name) {
                const formatter = createFormatter({
                    formatterName: name
                });
                const ckjFile = path.join(__dirname, "./fixtures", "ckj.md");
                const output = formatter([
                    {
                        filePath: __dirname + "/fixtures/myfile.js",
                        messages: [
                            {
                                type: "lint",
                                ruleId: "semi",
                                line: 1,
                                column: 1,
                                index: 0,
                                message: "0 pattern.",
                                severity: 2
                            },
                            {
                                type: "lint",
                                ruleId: "semi",
                                line: 2,
                                column: 26,
                                index: 0,
                                message: "Expected a semicolon.",
                                severity: 2
                            },
                            {
                                type: "lint",
                                ruleId: "semi",
                                line: 1,
                                column: 21,
                                index: 0,
                                message: "Expected a semicolon.",
                                severity: 2
                            },
                            {
                                type: "lint",
                                ruleId: "semi",
                                line: 2,
                                column: 26,
                                index: 0,
                                message: "Expected a semicolon.",
                                severity: 2
                            }
                        ]
                    },
                    {
                        filePath: ckjFile,
                        messages: [
                            {
                                type: "lint",
                                message: "Unexpected !!!.",
                                severity: 2,
                                line: 2,
                                column: 16,
                                index: 0,
                                ruleId: "foo",
                                fix: {
                                    range: [40, 45],
                                    text: "fixed 1"
                                }
                            }
                        ]
                    }
                ]);
                assert(output.length > 0);
            });
        });
    });
    describe("getFormatterList", function() {
        it("should return list of formatter(s)", function() {
            assert.deepEqual(getFormatterList(), [
                { name: "checkstyle" },
                { name: "compact" },
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
