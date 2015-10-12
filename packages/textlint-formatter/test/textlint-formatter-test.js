// LICENSE : MIT
"use strict";
var assert = require("power-assert");
var createFormatter = require("../");
describe("textlint-formatter-test", function () {
    describe("createFormatter", function () {
        it("should return formatter function", function () {
            var formatter = createFormatter({
                formatterName: "stylish"
            });
            assert(typeof formatter === "function");
        });
        context("formatter", function () {
            it("should return output text", function () {
                var formatter = createFormatter({
                    formatterName: "stylish"
                });
                var output = formatter([
                    {
                        filePath: "./myfile.js",
                        messages: [
                            {
                                ruleId: "semi",
                                line: 1,
                                column: 23,
                                message: "Expected a semicolon."
                            }
                        ]
                    }
                ]);
                assert(output.length > 0);
            });
        });
        it("run all formatter", function () {
            var formatterNames = [
                "checkstyle",
                "compact",
                "jslint-xml",
                "junit",
                "pretty-error",
                "stylish",
                "tap"
            ];
            formatterNames.forEach(function (name) {
                var formatter = createFormatter({
                    formatterName: name
                });
                var output = formatter([
                    {
                        filePath: __dirname + "/fixtures/myfile.js",
                        messages: [
                            {
                                ruleId: "semi",
                                line: 1,
                                column: 0,
                                message: "0 pattern."
                            },
                            {
                                ruleId: "semi",
                                line: 2,
                                column: 26,
                                message: "Expected a semicolon."
                            },
                            {
                                ruleId: "semi",
                                line: 1,
                                column: 21,
                                message: "Expected a semicolon."
                            },
                            {
                                ruleId: "semi",
                                line: 2,
                                column: 26,
                                message: "Expected a semicolon."
                            }
                        ]
                    }
                ]);
                assert(output.length > 0);
                console.log(output);
                console.log("==================");
            });
        });
    });

});