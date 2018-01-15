// LICENSE : MIT
"use strict";
import TextLintTester = require("../src/index");

const tester = new TextLintTester();

function rule(context: any) {
    const { Syntax, RuleError, report } = context;
    return {
        [Syntax.Document](node: any) {
            return new Promise(resolve => {
                setTimeout(() => {
                    report(node, new RuleError("error"));
                    resolve();
                }, 100);
            });
        }
    };
}

tester.run("async-rule", rule, {
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
