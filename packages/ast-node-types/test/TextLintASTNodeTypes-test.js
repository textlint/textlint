// MIT © 2017 azu
"use strict";
const TextLintASTNodeTypes = require("../src/TextLintASTNodeTypes");
const assert = require("assert");
describe("TextLintASTNodeTypes", () => {
    it("should have same value with key", () => {
        const keys = Object.keys(TextLintASTNodeTypes);
        keys.forEach(key => {
            const value = TextLintASTNodeTypes[key];
            assert.strictEqual(key, value);
        });
    });
});
