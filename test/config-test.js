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
            var config = Config.initWithAutoLoading({
                configFile: path.join(__dirname, "fixtures", ".textlintrc")
            });
            assert(config.rules.length > 0);
            assert(Object.keys(config.rulesConfig).length > 0);
            assert(config.rulePaths.length === 0);
        });
    });
    context("when exist `rules` adn `configFile`", function () {
        it("should not overwrite rules of options by config", function () {
            var options = {
                rules: {
                    // overwrite config file options by this
                    "no-todo": {
                        "key": "value"
                    }
                }
            };
            var config = Config.initWithAutoLoading({
                rules: Object.keys(options.rules),
                rulesConfig: options.rules,
                configFile: path.join(__dirname, "fixtures", ".textlintrc")
            });
            assert(config.rules.length > 0);
            assert.deepEqual(config.rules, ["no-todo"]);
            assert.deepEqual(config.rulesConfig, options.rules);
        });
    });
    context("when has `plugins` in configFile", function () {
        let config;
        beforeEach(function () {
            config = Config.initWithAutoLoading({
                rulesBaseDirectory: path.join(__dirname, "fixtures", "plugins"),
                configFile: path.join(__dirname, "fixtures", "plugin.textlintrc")
            });
        });
        it("should set config's `plugins`", function () {
            assert(config.plugins.length === 2);
            assert(config.plugins[0] === "example");
            assert(config.plugins[1] === "configurable-plugin");
        });
        it("should not set plugin's rule to config's `rules`", function () {
            assert(config.rules.length === 0);
        });
        it("should has rulesConfig that is loaded from plugins", function () {
            const exampleRule = "example-rule";
            const examplePlugin = require("./fixtures/plugins/textlint-plugin-example");
            const exampleRulesOptions = examplePlugin.rulesConfig[exampleRule];
            const configurableRule = "configurable-rule";
            const configurablePlugin = require("./fixtures/plugins/configurable-plugin");
            const configurableRulesOptions = configurablePlugin.rulesConfig[configurableRule];
            // "<plugin>/example-rule" : true
            assert.strictEqual(config.rulesConfig[`example/${exampleRule}`], exampleRulesOptions);
            assert.deepEqual(config.rulesConfig[`configurable-plugin/${configurableRule}`], configurableRulesOptions);
        });
        context("when textlintrc and plugin has same RulesOptions[key]", function () {
            it("should overwrite plugin's option by textlintrc's options", function () {
                const pluginName = "configurable-plugin";
                const ruleName = "overwrited-rule";
                const originalRuleConfig = require("./fixtures/plugins/configurable-plugin").rulesConfig[ruleName];
                const actualRuleConfig = config.rulesConfig[`${pluginName}/${ruleName}`];
                assert.notEqual(actualRuleConfig, originalRuleConfig);
                assert(actualRuleConfig === false); // overwrite by config file
            });
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