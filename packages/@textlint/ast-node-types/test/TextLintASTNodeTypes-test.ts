// MIT © 2017 azu
"use strict";
import * as assert from "assert";

import { ASTNodeTypes } from "../src";

describe("TextLintASTNodeTypes", () => {
    it("should have same value with key", () => {
        for (let key in ASTNodeTypes) {
            let value = ASTNodeTypes[key];
            assert.strictEqual(key, value);
        }
    });
});
