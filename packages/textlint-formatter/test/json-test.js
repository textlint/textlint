// LICENSE : MIT
"use strict";
var assert = require("power-assert");
describe("json-test", function () {
    it("should return json", function () {

        it("run all formatter", function () {
            var formatter = createFormatter({
                formatterName: "json"
            });
            var results = [
                {
                    filePath: __dirname + "/fixtures/myfile.js",
                    messages: [
                        {
                            ruleId: "semi",
                            line: 1,
                            column: 0,
                            message: "0 pattern."
                        },
                        {
                            ruleId: "semi",
                            line: 2,
                            column: 26,
                            message: "Expected a semicolon."
                        },
                        {
                            ruleId: "semi",
                            line: 1,
                            column: 21,
                            message: "Expected a semicolon."
                        },
                        {
                            ruleId: "semi",
                            line: 2,
                            column: 26,
                            message: "Expected a semicolon."
                        }
                    ]
                }
            ];
            var output = formatter(results);
            var reParse = JSON.parse(output);
            assert.deepEqual(reParse, results);
        });
    });
});