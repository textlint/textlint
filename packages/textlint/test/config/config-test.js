// LICENSE : MIT
"use strict";
var assert = require("power-assert");
var path = require("path");
import Config from "../../src/config/config";
/*
    config file test reference to config-as-example.js
 */
describe("config", function() {
    describe("#initWithCLIOptions", function() {
        context("when init with command line options", function() {
            it("should has not rules", async function() {
                var config = await Config.initWithCLIOptions({});
                assert(config.rules.length === 0);
                assert(config.rulePaths.length === 0);
            });
        });
        context("when specify --config", function() {
            it("should use the config file", async function() {
                var config = await Config.initWithCLIOptions({
                    config: path.join(__dirname, "fixtures", ".textlintrc")
                });
                assert(config.rules.length > 0);
            });
        });
    });
});
