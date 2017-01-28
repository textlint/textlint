// LICENSE : MIT
"use strict";
const assert = require("power-assert");
const path = require("path");
import ModuleResolver from "../../src/engine/textlint-module-resolver";
import loadConfig from "../../src/config/config-loader";
import Config from "../../src/config/config";
describe("config-loader", function () {
    it("should load config file", async function () {
        const configFile = path.join(__dirname, "fixtures", ".textlintrc");
        const result = await loadConfig(configFile, {
            configFileName: Config.CONFIG_FILE_NAME,
            configPackagePrefix: Config.CONFIG_PACKAGE_PREFIX
        });
        assert.equal(typeof result.rules["no-todo"], "object");
        assert(result.rules["no-todo"]["use-task-list"] === true);
    });
    context("when specify Config module, found it", function () {
        it("should load from Config module", async function () {
            const baseDir = path.join(__dirname, "fixtures");
            const moduleResolver = new ModuleResolver(Config, baseDir);
            const result = await loadConfig("@textlint/textlint-config-example", {
                moduleResolver,
                configFileName: Config.CONFIG_FILE_NAME
            });
            assert.equal(typeof result.rules.config, "object");
            assert(result.rules.config.key === true);
        });
    });
    context("when specify Config module, but not found", function () {
        it("should load same name of module", async function () {
            const baseDir = path.join(__dirname, "fixtures");
            const moduleResolver = new ModuleResolver(Config, baseDir);
            const directTextlintrc = path.join(__dirname, "fixtures", "alt-textlintrc");
            const result = await loadConfig(directTextlintrc, {
                moduleResolver,
                configFileName: Config.CONFIG_FILE_NAME
            });
            assert(result.rules);
            assert(result.rules["alt-rule"]);
        });
        it("should not load config", async function () {
            const baseDir = path.join(__dirname, "fixtures");
            const moduleResolver = new ModuleResolver(Config, baseDir);
            return loadConfig("UNKNOWN", {
                moduleResolver,
                configFileName: Config.CONFIG_FILE_NAME
            }).catch((result) => {
                assert(!result.rules);
            });
        });
    });
});
