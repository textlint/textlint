// LICENSE : MIT
"use strict";
import assert from "assert";
import path from "path";
import { Config } from "../../src/config/config";
/*
    config file test reference to config-as-example.js
 */
describe("config", function () {
    describe("#initWithCLIOptions", function () {
        context("when init with command line options", function () {
            it("should has not rules", function () {
                const config = Config.initWithCLIOptions({});
                assert.ok(config.rules.length === 0);
                assert.ok(config.rulePaths.length === 0);
            });
        });
        context("when specify --config", function () {
            it("should use the config file", function () {
                const config = Config.initWithCLIOptions({ config: path.join(__dirname, "fixtures", ".textlintrc") });
                assert.ok(config.rules.length > 0);
            });
        });
        context("when specify --no-textlintrc", function () {
            it("should not use the config file", function () {
                const config = Config.initWithCLIOptions({
                    textlintrc: false,
                    config: path.join(__dirname, "fixtures", ".textlintrc")
                });
                assert.ok(config.rules.length === 0);
            });
            it("should use the rules", function () {
                const rules = ["no-todo"];
                const config = Config.initWithCLIOptions({
                    textlintrc: false,
                    rule: rules
                });
                assert.deepEqual(config.rules, rules);
            });
        });
    });
    describe("#absolutePath", function () {
        context("when init configFile", function () {
            it("should return path to .textlintrc", function () {
                const configFilePath = path.join(__dirname, "fixtures", ".textlintrc");
                const config = Config.initWithCLIOptions({ config: configFilePath });
                assert.equal(config.configFile, configFilePath);
            });
        });
        context("when has not configFile", function () {
            it("should return undefined", function () {
                const config = new Config();
                assert.ok(config.configFile === undefined);
            });
        });
        context("when pass config module", function () {
            it("should return undefined", function () {
                const baseDir = path.join(__dirname, "fixtures");
                const config = Config.initWithAutoLoading({
                    textlintrc: true,
                    configFile: "@textlint/textlint-config-example",
                    rulesBaseDirectory: baseDir
                });
                assert.ok(config.configFile === path.join(baseDir, "@textlint/textlint-config-example", "index.ts"));
            });
        });
    });
});
