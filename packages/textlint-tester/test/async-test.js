// LICENSE : MIT
"use strict";
var TextLintTester = require("../src/index");
var tester = new TextLintTester();
function rule(context) {
    let {Syntax, RuleError, report, getSource} = context;
    return {
        [Syntax.Document](node){
            return new Promise((resolve) => {
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