// MIT © 2017 azu
"use strict";
const assert = require("assert");
import { TextLintCore } from "../../src/index";
import { createPluginStub } from "./fixtures/example-plugin";

describe("plugin-option", () => {
    it("should load plugin options if match ext", () => {
        const textlintCore = new TextLintCore();
        const { getPlugin, getOptions } = createPluginStub();
        const expectedOptions = { test: "expected" };
        textlintCore.setupPlugins({ example: getPlugin() }, { example: expectedOptions });
        textlintCore.setupRules({ "example-rule": require("./fixtures/example-rule") });
        return textlintCore.lintText("test", ".example").then(results => {
            const actualOptions = getOptions();
            assert.deepStrictEqual(actualOptions, expectedOptions);
        });
    });
    it("should load plugin options when does't match any ext for instance availableExtensions()", () => {
        const textlintCore = new TextLintCore();
        const { getPlugin, getOptions } = createPluginStub();
        const expectedOptions = { test: "expected" };
        textlintCore.setupPlugins({ example: getPlugin() }, { example: expectedOptions });
        textlintCore.setupRules({ "example-rule": require("./fixtures/example-rule") });
        // .md is built-in
        return textlintCore.lintText("test", ".md").then(results => {
            const actualOptions = getOptions();
            assert.strictEqual(actualOptions, expectedOptions);
        });
    });
});
