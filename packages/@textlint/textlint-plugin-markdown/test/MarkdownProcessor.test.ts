// LICENSE : MIT
"use strict";
import assert from "node:assert";
import { describe, it } from "vitest";
import { TextlintKernel, TextlintPluginOptions } from "@textlint/kernel";
import { parse } from "@textlint/markdown-to-ast";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import noTodo from "textlint-rule-no-todo";
import MarkdownPlugin from "../src/index.js";

const lintFile = (filePath: string, options: TextlintPluginOptions | boolean | undefined = true) => {
    const kernel = new TextlintKernel();
    const text = fs.readFileSync(filePath, "utf-8");
    return kernel.lintText(text, {
        filePath,
        ext: ".md",
        plugins: [
            {
                pluginId: "markdown",
                plugin: MarkdownPlugin,
                options
            }
        ],
        rules: [{ ruleId: "no-todo", rule: noTodo }]
    });
};
const lintText = (text: string, options = true) => {
    const kernel = new TextlintKernel();
    return kernel.lintText(text, {
        ext: ".md",
        plugins: [
            {
                pluginId: "markdown",
                plugin: MarkdownPlugin,
                options
            }
        ],
        rules: [{ ruleId: "no-todo", rule: noTodo }]
    });
};
describe("MarkdownPlugin", function () {
    describe("when target file is a HTML", function () {
        it("should report error", function () {
            const fixturePath = fileURLToPath(new URL("error.md", import.meta.url));
            return lintFile(fixturePath).then((results) => {
                assert(results.messages.length > 0);
                assert(results.filePath === fixturePath);
            });
        });
    });
    describe("extensions", function () {
        it("should report error if extensions define .custom extension", function () {
            const fixturePath = fileURLToPath(new URL("error.custom", import.meta.url));
            return lintFile(fixturePath, {
                extensions: [".custom"]
            }).then((results) => {
                assert(results.messages.length > 0);
                assert(results.filePath === fixturePath);
            });
        });
    });
    describe("cjkFriendly", function () {
        const input = "**このアスタリスクは強調記号として認識されず、そのまま表示されます。**この文のせいで。";

        it("should be disabled by default", function () {
            const processor = new MarkdownPlugin.Processor().processor(".md");
            assert.deepStrictEqual(processor.preProcess(input), parse(input));
        });

        it("should pass the option to the Markdown parser", function () {
            const processor = new MarkdownPlugin.Processor({ cjkFriendly: true }).processor(".md");
            assert.deepStrictEqual(processor.preProcess(input), parse(input, { cjkFriendly: true }));
        });
    });
    describe("When no file path", function () {
        it("should filePath is <ext>", function () {
            return lintText("- [ ] TODO").then((results) => {
                assert(results.messages.length > 0);
                assert.strictEqual(results.filePath, "<markdown>");
            });
        });
    });
});
