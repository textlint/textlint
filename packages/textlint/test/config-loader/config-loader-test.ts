// LICENSE : MIT
"use strict";
const assert = require("assert");
const path = require("path");
import { TextLintModuleResolver } from "../../src/engine/textlint-module-resolver";
import { loadConfig } from "../../src/config/config-loader";
import { Config } from "../../src/config/config";

const dummyModuleLoader = new TextLintModuleResolver({
    rulesBaseDirectory: path.join(__dirname, "fixtures")
});
describe("config-loader", function() {
    it("should load config file", function() {
        const configFile = path.join(__dirname, "fixtures", ".textlintrc");
        const { config } = loadConfig({
            configFileName: Config.CONFIG_FILE_NAME,
            configFilePath: configFile,
            moduleResolver: dummyModuleLoader
        });
        assert.equal(typeof config.rules["no-todo"], "object");
        assert.equal(config.rules["no-todo"]["use-task-list"], true);
    });
    context("when config file is not encoded in UTF8", () => {
        // FIXME: https://github.com/textlint/textlint/issues/298
        it.skip("should throw an Error", () => {
            const notUTF8Files = ["shift-jis.js", "euc-jp.json"];
            notUTF8Files.forEach(notUTF8File => {
                const configFile = path.join(__dirname, "fixtures", "shift-jis.js");
                assert.throws(() => {
                    loadConfig({
                        configFileName: Config.CONFIG_FILE_NAME,
                        configFilePath: configFile,
                        moduleResolver: dummyModuleLoader
                    });
                }, notUTF8File);
            });
        });
    });
    context("when specify Config module, found it", function() {
        it("should load from Config module", function() {
            const baseDir = path.join(__dirname, "fixtures");
            const moduleResolver = new TextLintModuleResolver({
                rulesBaseDirectory: baseDir
            });
            const { config } = loadConfig({
                moduleResolver,
                configFilePath: "@textlint/textlint-config-example",
                configFileName: Config.CONFIG_FILE_NAME
            });
            assert.strictEqual(typeof config.rules.config, "object");
            assert.ok(config.rules.config.key === true);
        });
    });
    context("when specify Config module, but not found", function() {
        it("should load same name of module", function() {
            const baseDir = path.join(__dirname, "fixtures");
            const moduleResolver = new TextLintModuleResolver({
                rulesBaseDirectory: baseDir
            });
            const directTextlintrc = path.join(__dirname, "fixtures", "alt.textlintrc");
            const { config, filePath } = loadConfig({
                moduleResolver,
                configFilePath: directTextlintrc,
                configFileName: Config.CONFIG_FILE_NAME
            });
            assert.ok(config.rules, "should have config.rules");
            assert.ok(config.rules["alt-rule"]);
            assert.ok(filePath === directTextlintrc);
        });
        it("should not load config", function() {
            const baseDir = path.join(__dirname, "fixtures");
            const moduleResolver = new TextLintModuleResolver({
                rulesBaseDirectory: baseDir
            });
            const result = loadConfig({
                moduleResolver,
                configFilePath: "UNKNOWN",
                configFileName: Config.CONFIG_FILE_NAME
            });
            assert.ok(!result.config.rules);
            assert.ok(!result.filePath, "filePath should be undefined");
        });
    });
});
