// LICENSE : MIT
"use strict";
import { TextLintCore } from "../../src/index";
import assert from "power-assert";
import { assertRuleContext } from "./assert-rule-context";
describe("Fixer Rule", function() {
    it("should context and receive options", function() {
        const textlint = new TextLintCore();
        const expectedOptions = { key: "value", str: "string", on: true };
        const assertReporter = (context, options) => {
            assertRuleContext(context);
            assert.deepEqual(options, expectedOptions);
            return {};
        };
        textlint.setupRules(
            // ruleCreator
            { "rule-name": { linter: assertReporter, fixer: assertReporter } }, // config
            { "rule-name": expectedOptions }
        );
        return textlint.lintMarkdown("string").then(result => {
            assert(result.filePath === "<markdown>");
            assert(result.messages.length === 0);
        });
    });
});
