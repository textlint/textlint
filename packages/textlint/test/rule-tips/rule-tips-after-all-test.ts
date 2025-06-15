// MIT © 2017 azu
"use strict";
import * as assert from "node:assert";
import { describe, it } from "vitest";
import { createAfterAllRule } from "./fixtures/rules/after-all.js";
import { TextLintCore } from "@textlint/legacy-textlint-core";
describe("rule-tips-after-all-test", function () {
    // Test https://github.com/textlint/textlint/issues/266#issuecomment-293192017
    it("should after-all is called at end", function () {
        const textlint = new TextLintCore();
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
