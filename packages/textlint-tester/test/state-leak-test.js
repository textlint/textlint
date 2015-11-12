// LICENSE : MIT
"use strict";
var TextLintTester = require("../src/textlint-tester");
var tester = new TextLintTester();
// TODO: textlint 5.0.0 pass this test.
// In the future, textlint fail this test.
// So, This test is disable
/*
function stateLeak(context) {
    let {Syntax, RuleError, report, getSource} = context;
    let count = 0;
    return {
        [Syntax.Str](node){
            let text = getSource(node);
            // count "test" ++
            if (/test/.test(text)) {
                count++;
            }
        },
        [Syntax.Document + ":exit"](node){
            console.log(count);
            if (count > 0) {
                report(node, new RuleError("count is " + count));
            }
        }
    }
}
tester.run("state-leak", stateLeak, {
    valid: [
        "no problem",
        {
            text: "日本語 is Japanese."
        }
    ],
    invalid: [
        {
            text: "test",
            errors: [
                {
                    message: "count is 1"
                }
            ]
        },
        {
            text: "- test\n- test",
            errors: [
                {
                    message: "count is 2"
                }
            ]
        }
    ]
});
*/