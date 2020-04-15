// LICENSE : MIT
"use strict";
import TextLintTester = require("../src/index");
import { TextlintRuleReporter } from "@textlint/types";

const tester = new TextLintTester();

const report: TextlintRuleReporter = (context) => {
    const { Syntax, RuleError, report } = context;
    return {
        ["my other type"](_node) {
            throw new Error("DO NOT CALL");
        },
        [Syntax.Document](node) {
            return new Promise((resolve) => {
                setTimeout(() => {
                    report(node, new RuleError("error"));
                    resolve();
                }, 100);
            });
        }
    };
};

tester.run("async-rule", report, {
    invalid: [
        {
            text: "test",
            errors: [
                {
                    message: "error"
                }
            ]
        }
    ]
});
