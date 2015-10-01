// LICENSE : MIT
"use strict";
var assert = require("power-assert");
var Config = require("../src/config/config");
var path = require("path");
describe("config", function () {
    context("on default", function () {
        it("should has not rules", function () {
            var config = new Config();
            assert(config.rules.length === 0);
            assert(Object.keys(config.rulesConfig).length === 0);
            assert(config.rulePaths.length === 0);
        });
    });
    context("when set `configFile`", function () {
        it("should has config.rules", function () {
            var config = new Config({
                configFile: path.join(__dirname, "fixtures", ".textlintrc")
            });
            assert(config.rules.length > 0);
            assert(Object.keys(config.rulesConfig).length > 0);
            assert(config.rulePaths.length === 0);
        })
    });
    describe("#initWithCLIOptions", function () {
        context("when init with command line options", function () {
            it("should has not rules", function () {
                var config = Config.initWithCLIOptions({});
                assert(config.rules.length === 0);
                assert(config.rulePaths.length === 0);
            });
        });
        context("when specify --config", function () {
            it("should use the config file", function () {
                var config = Config.initWithCLIOptions({
                    config: path.join(__dirname, "fixtures", ".textlintrc")
                });
                assert(config.rules.length > 0);
            });
        });
    });
});