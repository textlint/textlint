// MIT © 2017 azu
"use strict";
import * as assert from "assert";

import { ASTNodeTypes } from "../src";

describe("TextLintASTNodeTypes", () => {
    it("should have same value with key", () => {
        for (let key in ASTNodeTypes) {
            if (key.includes("Exit")) {
                return;
            }
            const value = ASTNodeTypes[key];
            assert.strictEqual(key, value);
        }
    });
    it("Exit type should have :exit value ", () => {
        for (let key in ASTNodeTypes) {
            if (key.includes("Exit")) {
                const value = ASTNodeTypes[key];
                assert.ok(value.includes(":exit"), "should includes :exit");
            }
        }
    });
});
