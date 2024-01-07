// MIT © 2017 azu
"use strict";
import * as assert from "assert";
import { createAfterAllRule } from "./fixtures/rules/after-all";
import { TextLintCoreCompat } from "../util/TextlintCoreCompat";
describe("rule-tips-after-all-test", function () {
    // Test https://github.com/textlint/textlint/issues/266#issuecomment-293192017
    it("should after-all is called at end", function () {
        const textlint = new TextLintCoreCompat();
        const calls: string[] = [];
        const afterAllRule = createAfterAllRule(calls);
        textlint.setupRules({ "after-all": afterAllRule });
        const text = "test test";
        return textlint.lintMarkdown(text).then(() => {
            const [first, afterAll] = calls;
            assert.equal(first, text);
            assert.equal(afterAll, "after-all");
        });
    });
});
