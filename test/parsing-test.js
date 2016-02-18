// LICENSE : MIT
"use strict";
const assert = require("power-assert");
const cli = require("../src/").cli;
const path = require("path");
describe("parsing", function () {
    it("should lint all files without error", function () {
        var ruleDir = "--rulesdir " + path.join(__dirname, "fixtures/rules/no-error");
        var testDir = __dirname + "/input/";
        return cli.execute(ruleDir + " " + testDir).then(result => {
            assert.equal(result, 0);
        });
    });
});