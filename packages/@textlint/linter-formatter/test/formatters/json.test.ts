/**
 * @fileoverview Tests for JSON reporter.
 * @author Burak Yigit Kaya aka BYK
 * @copyright 2015 Burak Yigit Kaya. All rights reserved.
 */

import formatter from "../../src/formatters/json.js";

import { describe, it } from "vitest";

import * as assert from "node:assert";
import type { TextlintResult } from "@textlint/types";
import { createTestMessage, createTestResult } from "../test-helper";

describe("formatter:json", function () {
    const code: TextlintResult[] = [
        createTestResult({
            filePath: "foo.js",
            messages: [
                createTestMessage({
                    message: "Unexpected foo.",
                    severity: 2,
                    line: 5,
                    column: 10,
                    ruleId: "foo"
                })
            ]
        }),
        createTestResult({
            filePath: "bar.js",
            messages: [
                createTestMessage({
                    message: "Unexpected bar.",
                    severity: 1,
                    line: 6,
                    column: 11,
                    ruleId: "bar"
                })
            ]
        })
    ];

    it("should return passed results as a JSON string without any modification", function () {
        const result = JSON.parse(formatter(code as TextlintResult[]));
        assert.deepEqual(result, code);
    });
});
