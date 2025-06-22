// LICENSE : MIT
"use strict";
import assert from "node:assert";
import { describe, it } from "vitest";
import fs from "node:fs";
import TextPlugin from "../src/index.js";
import { TextlintKernel, TextlintPluginOptions } from "@textlint/kernel";
import path from "node:path";

const lintFile = (filePath: string, options: boolean | TextlintPluginOptions | undefined = true) => {
    const kernel = new TextlintKernel();
    const text = fs.readFileSync(filePath, "utf-8");
    return kernel.lintText(text, {
        filePath,
        ext: ".txt",
        plugins: [
            {
                pluginId: "text",
                plugin: TextPlugin,
                options
            }
        ],
        rules: [{ ruleId: "no-todo", rule: require("textlint-rule-no-todo").default }]
    });
};

const lintText = (text: string, options: boolean | TextlintPluginOptions | undefined = true) => {
    const kernel = new TextlintKernel();
    return kernel.lintText(text, {
        ext: ".txt",
        plugins: [
            {
                pluginId: "text",
                plugin: TextPlugin,
                options
            }
        ],
        rules: [{ ruleId: "no-todo", rule: require("textlint-rule-no-todo").default }]
    });
};

describe("TextProcessor", function () {
    describe("when target file is a Text", function () {
        it("should report error", function () {
            const fixturePath = path.join(__dirname, "fixtures/test.txt");
            return lintFile(fixturePath).then((results) => {
                assert(results.messages.length > 0);
                assert(results.filePath === fixturePath);
            });
        });
    });
    describe("when extensions option is specified", function () {
        it("should report error", function () {
            const fixturePath = path.join(__dirname, "fixtures/test.custom");
            return lintFile(fixturePath, {
                extensions: [".custom"]
            }).then((results) => {
                assert(results.messages.length > 0);
                assert(results.filePath === fixturePath);
            });
        });
    });
    describe("when target is text", function () {
        it("should report error", function () {
            return lintText("TODO: this is todo").then((results) => {
                assert(results.messages.length === 1);
                assert(results.filePath === "<text>");
            });
        });
    });
});
