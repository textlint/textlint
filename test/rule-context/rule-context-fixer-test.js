// LICENSE : MIT
"use strict";
import {TextLintCore} from "../../src/index";
import RuleContext from "../../src/core/rule-context";
import assert from "power-assert";
describe("Fixer Rule", function () {
    it("should context and receive options", function () {
        const textlint = new TextLintCore();
        const expectedOptions = {
            key: "value",
            str: "string",
            on: true
        };
        const assertReporter = (context, options) => {
            assert(context instanceof RuleContext);
            assert.deepEqual(options, expectedOptions);
            return {};
        };
        textlint.setupRules(
            // ruleCreator
            {
                "rule-name": {
                    linter: assertReporter,
                    fixer: assertReporter
                }
            },
            // config
            {
                "rule-name": expectedOptions
            }
        );
        return textlint.lintMarkdown("string").then(result => {
            assert(result.filePath === "<markdown>");
            assert(result.messages.length === 0);
        });
    });
});
