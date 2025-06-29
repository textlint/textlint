/**
 * @fileoverview Tests for JSON reporter.
 * @author Burak Yigit Kaya aka BYK
 * @copyright 2015 Burak Yigit Kaya. All rights reserved.
 */

import formatter from "../../src/formatters/json.js";

import { describe, it } from "vitest";

import * as assert from "node:assert";

describe("formatter:json", function () {
    const code = [
        {
            filePath: "foo.js",
            messages: [
                {
                    message: "Unexpected foo.",
                    severity: 2,
                    line: 5,
                    column: 10,
                    ruleId: "foo",
                    source: "foo"
                }
            ]
        },
        {
            filePath: "bar.js",
            messages: [
                {
                    message: "Unexpected bar.",
                    severity: 1,
                    line: 6,
                    column: 11,
                    ruleId: "bar",
                    source: "bar"
                }
            ]
        }
    ];

    it("should return passed results as a JSON string without any modification", function () {
        const result = JSON.parse(formatter(code as any));
        assert.deepEqual(result, code);
    });
});
