// MIT © 2017 azu
"use strict";
const { ASTNodeTypes } = require("../lib/TextLintASTNodeTypes");
const assert = require("assert");
describe("TextLintASTNodeTypes", () => {
    it("should have same value with key", () => {
        const keys = Object.keys(ASTNodeTypes);
        keys.forEach(key => {
            const value = ASTNodeTypes[key];
            assert.strictEqual(key, value);
        });
    });
});
