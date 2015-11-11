// LICENSE : MIT
"use strict";
import {TextLintCore} from "../src/index";
import assert from "power-assert";
describe("async rule", function () {
    it("should support", function () {
        var textlint = new TextLintCore();
        textlint.setupRules({
            "rule-name": function (context) {
                let { Syntax, report, RuleError } = context;

                return {
                    [Syntax.Str](node){
                        return new Promise((resolve) => {
                            setTimeout(()=> {
                                report(node, new RuleError("before"));
                                resolve();
                            }, 100);
                        });
                    },
                    [Syntax.Str + ":exit"](node){
                        report(node, new RuleError("after"));
                    }
                }
            }
        });
        return textlint.lintMarkdown("string").then(result => {
            assert(result.filePath === "<markdown>");
            assert(result.messages.length === 2);
        });
    });
});