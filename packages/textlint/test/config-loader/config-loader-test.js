// LICENSE : MIT
"use strict";
const assert = require("power-assert");
const path = require("path");
import ModuleResolver from "../../src/engine/textlint-module-resolver";
import loadConfig from "../../src/config/config-loader";
import Config from "../../src/config/config";
describe("config-loader", function () {
    it("should load config file", function () {
        const configFile = path.join(__dirname, "fixtures", ".textlintrc");
        const result = loadConfig(configFile, {
            configFileName: Config.CONFIG_FILE_NAME,
            configPackagePrefix: Config.CONFIG_PACKAGE_PREFIX
        });
        assert.equal(typeof result.rules["no-todo"], "object");
        assert(result.rules["no-todo"]["use-task-list"] === true);
    });
    context("when specify Config module, found it", function () {
        it("should load from Config module", function () {
            const baseDir = path.join(__dirname, "fixtures");
            const moduleResolver = new ModuleResolver(Config, baseDir);
            const result = loadConfig("@textlint/textlint-config-example", {
                moduleResolver,
                configFileName: Config.CONFIG_FILE_NAME
            });
            assert.equal(typeof result.rules.config, "object");
            assert(result.rules.config.key === true);
        });
    });
    context("when specify Config module, but not found", function () {
        it("should load same name of module", function () {
            const baseDir = path.join(__dirname, "fixtures");
            const moduleResolver = new ModuleResolver(Config, baseDir);
            const directTextlintrc = path.join(__dirname, "fixtures", "alt-textlintrc");
            const result = loadConfig(directTextlintrc, {
                moduleResolver,
                configFileName: Config.CONFIG_FILE_NAME
            });
            assert(result.rules);
            assert(result.rules["alt-rule"]);
        });
        it("should not load config", function () {
            const baseDir = path.join(__dirname, "fixtures");
            const moduleResolver = new ModuleResolver(Config, baseDir);
            const result = loadConfig("UNKNOWN", {
                moduleResolver,
                configFileName: Config.CONFIG_FILE_NAME
            });
            assert(!result.rules);
        });
    });
});
