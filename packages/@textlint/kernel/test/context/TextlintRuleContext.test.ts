// LICENSE : MIT
"use strict";
import * as assert from "node:assert";
import { describe, it } from "vitest";
import { assertRuledescribe } from "./assert-rule-context.js";
import { TextlintRuleModule } from "@textlint/types";
import { TextlintKernel } from "../../src/index.js";
import { createPluginStub } from "../helper/ExamplePlugin.js";

describe("Context", function () {
    it("should receive context and options", function () {
        const kernel = new TextlintKernel();
        const expectedOptions = { key: "value", str: "string", on: true };
        const assertReporter: TextlintRuleModule = (context, options) => {
            assertRuledescribe(context);
            assert.deepEqual(options, expectedOptions);
            return {};
        };
        const rules = [
            {
                ruleId: "example-rule",
                rule: { linter: assertReporter, fixer: assertReporter },
                options: expectedOptions
            }
        ];
        const { plugin } = createPluginStub({
            extensions: [".md"]
        });
        return kernel
            .fixText("string", {
                rules,
                plugins: [{ pluginId: "markdown", plugin }],
                ext: ".md"
            })
            .then((result) => {
                assert.strictEqual(result.messages.length, 0);
            });
    });

    it("context.id should be rule id", function () {
        const kernel = new TextlintKernel();
        const assertReporter: TextlintRuleModule = (context, options) => {
            assert.strictEqual(context.id, "example-rule");
            assert.deepStrictEqual(options, {});
            return {};
        };
        const rules = [
            {
                ruleId: "example-rule",
                rule: { linter: assertReporter, fixer: assertReporter }
            }
        ];
        const { plugin } = createPluginStub({
            extensions: [".md"]
        });
        return kernel
            .fixText("string", {
                rules,
                plugins: [{ pluginId: "markdown", plugin }],
                ext: ".md"
            })
            .then((result) => {
                assert.strictEqual(result.messages.length, 0);
            });
    });
    it("context.options should be {} by default", function () {
        const kernel = new TextlintKernel();
        const assertReporter: TextlintRuleModule = (_, options) => {
            assert.deepStrictEqual(options, {});
            return {};
        };
        const rules = [
            {
                ruleId: "example-rule",
                rule: { linter: assertReporter, fixer: assertReporter }
            }
        ];
        const { plugin } = createPluginStub({
            extensions: [".md"]
        });
        return kernel
            .fixText("string", {
                rules,
                plugins: [{ pluginId: "markdown", plugin }],
                ext: ".md"
            })
            .then((result) => {
                assert.strictEqual(result.messages.length, 0);
            });
    });
    it("context.getConfigBaseDir should return config directory path", function () {
        const kernel = new TextlintKernel();
        const configBaseDir = process.cwd();
        const assertReporter: TextlintRuleModule = (context) => {
            assert.strictEqual(context.getConfigBaseDir(), configBaseDir);
            return {};
        };
        const rules = [
            {
                ruleId: "example-rule",
                rule: { linter: assertReporter, fixer: assertReporter }
            }
        ];
        const { plugin } = createPluginStub({
            extensions: [".md"]
        });
        return kernel
            .lintText("string", {
                rules,
                configBaseDir,
                plugins: [{ pluginId: "markdown", plugin }],
                ext: ".md"
            })
            .then((result) => {
                assert.strictEqual(result.messages.length, 0);
            });
    });
});
