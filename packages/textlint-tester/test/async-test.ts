// LICENSE : MIT
"use strict";
import TextLintTester = require("../src/index");
import { TextlintRuleReporter } from "@textlint/types";

const tester = new TextLintTester();

const report: TextlintRuleReporter = context => {
    const { Syntax, RuleError, report } = context;
    return {
        [Syntax.Document](node) {
            return new Promise(resolve => {
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
