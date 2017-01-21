// LICENSE : MIT
"use strict";
const assert = require("power-assert");
import RuleFixer from "../../src/fixer/rule-fixer";
// Original: https://github.com/eslint/eslint/blob/master/tests/lib/util/rule-fixer.js
describe("RuleFixer", function() {
    let fixer;
    beforeEach(function() {
        fixer = new RuleFixer();
    });
    describe("insertTextBefore", function() {
        it("should return an object with the correct information when called", function() {
            const result = fixer.insertTextBefore({range: [0, 1]}, "Hi");
            assert.deepEqual(result, {
                range: [0, 0],
                text: "Hi",
                isAbsolute: true
            });
        });
    });
    describe("insertTextBeforeRange", function() {
        it("should return an object with the correct information when called", function() {
            const result = fixer.insertTextBeforeRange([0, 1], "Hi");
            assert.deepEqual(result, {
                range: [0, 0],
                text: "Hi",
                isAbsolute: false
            });
        });
    });
    describe("insertTextAfter", function() {
        it("should return an object with the correct information when called", function() {
            const result = fixer.insertTextAfter({range: [0, 1]}, "Hi");
            assert.deepEqual(result, {
                range: [1, 1],
                text: "Hi",
                isAbsolute: true
            });
        });
    });
    describe("insertTextAfterRange", function() {
        it("should return an object with the correct information when called", function() {
            const result = fixer.insertTextAfterRange([0, 1], "Hi");
            assert.deepEqual(result, {
                range: [1, 1],
                text: "Hi",
                isAbsolute: false
            });
        });
    });
    describe("removeAfter", function() {
        it("should return an object with the correct information when called", function() {
            const result = fixer.remove({range: [0, 1]});
            assert.deepEqual(result, {
                range: [0, 1],
                text: "",
                isAbsolute: true
            });
        });
    });
    describe("removeAfterRange", function() {
        it("should return an object with the correct information when called", function() {
            const result = fixer.removeRange([0, 1]);
            assert.deepEqual(result, {
                range: [0, 1],
                text: "",
                isAbsolute: false
            });
        });
    });
    describe("replaceText", function() {
        it("should return an object with the correct information when called", function() {
            const result = fixer.replaceText({range: [0, 1]}, "Hi");
            assert.deepEqual(result, {
                range: [0, 1],
                text: "Hi",
                isAbsolute: true
            });
        });
    });
    describe("replaceTextRange", function() {
        it("should return an object with the correct information when called", function() {
            const result = fixer.replaceTextRange([0, 1], "Hi");
            assert.deepEqual(result, {
                range: [0, 1],
                text: "Hi",
                isAbsolute: false
            });
        });
    });
});
