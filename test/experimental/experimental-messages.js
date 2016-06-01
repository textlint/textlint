// LICENSE : MIT
"use strict";
/*
    Main Task Run lint and work filter
 */
const assert = require("power-assert");
import {setExperimental} from "../../src/util/throw-log";
import TextLintCore from "../../src/textlint-core";
const reverseOrderRule = (context) => {
    return {
        [context.Syntax.Document](node){
            context.report(node, new context.RuleError("Index 3", {
                index: 3
            }));
            context.report(node, new context.RuleError("Index 2", {
                index: 2
            }));
            context.report(node, new context.RuleError("Index 1", {
                index: 1
            }));
        }
    };
};

const workOnlyExperimental = function () {
    const textlint = new TextLintCore();
    textlint.setupRules({
        reverseOrderRule: reverseOrderRule
    });
    return textlint.lintText("test").then(result => {
        assert.equal(result.messages.length, 3);
        const [m1,m2,m3] = result.messages;
        assert.equal(m1.message, "Index 1");
        assert.equal(m2.message, "Index 2");
        assert.equal(m3.message, "Index 3");
    });
};
describe("sortMessageProcess", function () {
    it("should work only experimental", function () {
        setExperimental(true);
        return workOnlyExperimental();
    });
    it("should not work at normal", function () {
        setExperimental(false);
        return workOnlyExperimental().then(() => {
            throw new Error("this is experimental feature");
        }, (error) => {
            // Error is OK
            assert(error instanceof Error);
        });
    });

});
