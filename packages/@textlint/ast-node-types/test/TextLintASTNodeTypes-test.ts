// MIT © 2017 azu
"use strict";
import * as assert from "assert";

import { ASTNodeTypes } from "../src";

describe("TextLintASTNodeTypes", () => {
    it("should have same value with key", () => {
        Object.entries(ASTNodeTypes).forEach(([key, value]) => {
            if (key.includes("Exit")) {
                return;
            }
            assert.strictEqual(key, value);
        });
    });
    it("Exit type should have :exit value ", () => {
        Object.entries(ASTNodeTypes).forEach(([key, value]) => {
            if (!key.includes("Exit")) {
                return;
            }
            assert.ok(value.includes(":exit"), "should includes :exit");
        });
    });
});
