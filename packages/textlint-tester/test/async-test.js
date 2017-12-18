// LICENSE : MIT
"use strict";
const TextLintTester = require("../src/index");
const tester = new TextLintTester();
function rule(context) {
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
