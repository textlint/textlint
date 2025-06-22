// MIT © 2017 azu
"use strict";
import assert from "node:assert";
import { describe, it } from "vitest";
import { createPluginStub } from "./fixtures/example-plugin.js";
import exampleRule from "./fixtures/example-rule.js";
import { TextLintCore } from "@textlint/legacy-textlint-core";

describe("plugin-option", () => {
    it("should load plugin options if match ext", () => {
        const textlintCore = new TextLintCore();
        const { plugin, getOptions } = createPluginStub();
        const expectedOptions = { test: "expected" };
        textlintCore.setupPlugins({ example: plugin }, { example: expectedOptions });
        textlintCore.setupRules({ "example-rule": exampleRule });
        return textlintCore.lintText("test", ".example").then(() => {
            const actualOptions = getOptions();
            assert.deepStrictEqual(actualOptions, expectedOptions);
        });
    });
    it("should load plugin options when does't match any ext for instance availableExtensions()", () => {
        const textlintCore = new TextLintCore();
        const { plugin, getOptions } = createPluginStub();
        const expectedOptions = { test: "expected" };
        textlintCore.setupPlugins({ example: plugin }, { example: expectedOptions });
        textlintCore.setupRules({ "example-rule": exampleRule });
        // .md is built-in
        return textlintCore.lintText("test", ".md").then(() => {
            const actualOptions = getOptions();
            assert.strictEqual(actualOptions, expectedOptions);
        });
    });
});
