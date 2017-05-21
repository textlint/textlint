// LICENSE : MIT
"use strict";
const assert = require("power-assert");
const path = require("path");
import Config from "../../src/config/config";
/*
    config file test reference to config-as-example.js
 */
describe("config", function() {
    describe("#initWithCLIOptions", function() {
        context("when init with command line options", function() {
            it("should has not rules", function() {
                const config = Config.initWithCLIOptions({});
                assert(config.rules.length === 0);
                assert(config.rulePaths.length === 0);
            });
        });
        context("when specify --config", function() {
            it("should use the config file", function() {
                const config = Config.initWithCLIOptions({
                    config: path.join(__dirname, "fixtures", ".textlintrc")
                });
                assert(config.rules.length > 0);
            });
        });
    });
    describe("#absolutePath", function() {
        context("when init configFile", function() {
            it("should return path to .textlintrc", function() {
                const configFilePath = path.join(__dirname, "fixtures", ".textlintrc");
                const config = Config.initWithCLIOptions({
                    config: configFilePath
                });
                assert.equal(config.configFile, configFilePath);
            });
        });
        context("when has not configFile", function() {
            it("should return undefined", function() {
                const config = new Config();
                assert(config.configFile === undefined);
            });
        });
        context("when pass config module", function() {
            it("should return undefined", function() {
                const baseDir = path.join(__dirname, "fixtures");
                const config = Config.initWithAutoLoading({
                    configFile: "@textlint/textlint-config-example",
                    rulesBaseDirectory: baseDir
                });
                assert(config.configFile === path.join(baseDir, "@textlint/textlint-config-example", "index.js"));
            });
        });
    });
});
