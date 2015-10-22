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
        });
    });
    context("when has `plugins` in configFile", function () {
        it("should set config's `plugins`", function () {
            var config = new Config({
                rulesBaseDirectory: path.join(__dirname, "fixtures", "plugins"),
                configFile: path.join(__dirname, "fixtures", "plugin.textlintrc")
            });
            assert(config.plugins.length === 2);
            assert(config.plugins[0] === "example");
            assert(config.plugins[1] === "configurable-plugin");
        });
        it("should has rulesConfig that is loaded from plugins", function () {
            var config = new Config({
                rulesBaseDirectory: path.join(__dirname, "fixtures", "plugins"),
                configFile: path.join(__dirname, "fixtures", "plugin.textlintrc")
            });
            const exampleRule = "example-rule";
            var examplePlugin = require("./fixtures/plugins/textlint-plugin-example");
            const exampleRulesOptions = examplePlugin.rulesConfig[exampleRule];
            const configurableRule = "configurable-rule";
            var configurablePlugin = require("./fixtures/plugins/configurable-plugin");
            const configurableRulesOptions = configurablePlugin.rulesConfig[configurableRule];
            // "example-rule" : true
            assert.strictEqual(config.rulesConfig[exampleRule], exampleRulesOptions);
            assert.deepEqual(config.rulesConfig[configurableRule], configurableRulesOptions);
        });
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