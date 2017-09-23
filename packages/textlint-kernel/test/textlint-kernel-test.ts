// MIT © 2017 azu
"use strict";
const assert = require("assert");
import { TextlintKernel } from "../src/textlint-kernel";
import { errorRule } from "./helper/ErrorRule";
describe("textlint-kernel", () => {
    describe("#lintText", () => {
        it("should return messages", () => {
            const kernel = new TextlintKernel();
            const options = {
                filePath: "/path/to/file.md",
                ext: ".md",
                plugins: [
                    {
                        pluginId: "markdown",
                        plugin: require("textlint-plugin-markdown")
                    }
                ],
                rules: [
                    {
                        ruleId: "error",
                        rule: errorRule,
                        options: {
                            errors: [
                                {
                                    message: "error message",
                                    index: 0
                                }
                            ]
                        }
                    }
                ]
            };
            return kernel.lintText("text", options).then(result => {
                assert.ok(typeof result.filePath === "string");
                assert.ok(result.messages.length === 1);
            });
        });
        context("when pass invalid options", () => {
            it("should throw validation error", () => {
                const kernel = new TextlintKernel({});
                return kernel
                    .lintText("text", {
                        ext: "test",
                        plugins: [
                            {
                                pluginId: 1
                            }
                        ]
                    } as any)
                    .catch(error => {
                        assert.ok(error instanceof Error);
                    });
            });
        });
    });
    describe("#fixText", () => {
        it("should return messages", () => {
            const kernel = new TextlintKernel();
            const options = {
                filePath: "/path/to/file.md",
                ext: ".md",
                plugins: [
                    {
                        pluginId: "markdown",
                        plugin: require("textlint-plugin-markdown")
                    }
                ],
                rules: [
                    {
                        ruleId: "error",
                        rule: errorRule,
                        options: {
                            errors: [
                                {
                                    message: "error message",
                                    index: 0
                                }
                            ]
                        }
                    }
                ]
            };
            return kernel.fixText("text", options).then(result => {
                assert.ok(typeof result.filePath === "string");
                assert.ok(result.messages.length === 1);
            });
        });
        context("when pass invalid options", () => {
            it("should throw validation error", () => {
                const kernel = new TextlintKernel({});
                return kernel
                    .fixText("text", {
                        ext: "test",
                        plugins: [
                            {
                                pluginId: 1
                            }
                        ]
                    } as any)
                    .catch(error => {
                        assert.ok(error instanceof Error);
                    });
            });
        });
    });
});
