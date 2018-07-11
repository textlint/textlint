// LICENSE : MIT
"use strict";
const path = require("path");
import * as assert from "assert";
import { loadFromDir } from "../../src/engine/rule-loader";
import { assertRuleShape } from "../../src/textlintrc-descriptor/rule-creator-helper";
const fixtureDir = path.join(__dirname, "fixtures", "rule-loader");
describe("engine/rule-loader", function() {
    it("should return object", function() {
        const rules = loadFromDir(fixtureDir);
        assert.equal(typeof rules, "object");
        const keys = Object.keys(rules);
        assert.deepEqual(keys.sort(), ["foo", "bar"].sort());
        keys.forEach(key => {
            assertRuleShape(rules[key]);
        });
    });
    it("should filter by extension", function() {
        const rules = loadFromDir(fixtureDir, ".unknown");
        assert.deepEqual(rules, {});
    });
});
