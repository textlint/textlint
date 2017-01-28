// LICENSE : MIT
"use strict";
const assert = require("power-assert");
const path = require("path");
const os = require("os");
const sh = require("shelljs");
import Config from "../../src/config/config";
import configInit from "../../src/config/config-initializer";
import loadConfig from "../../src/config/config-loader";
import Logger from "../../src/util/logger";
/*
 config file generate test
 */
describe("config-initializer-test", function() {
    let configDir;
    const originErrorLog = Logger.error;

    beforeEach(function() {
        configDir = os.tmpdir() + "/textlint-config";
        sh.mkdir("-p", configDir);
    });

    afterEach(function() {
        sh.rm("-r", configDir);
    });
    context("when pacakge.json has textlint-rule-* packages", function() {
        beforeEach(function() {
            const packageFilePath = path.join(__dirname, "fixtures", "package.json");
            sh.cp(packageFilePath, configDir);
        });
        it("should create new file with packages", function() {
            const configFile = path.join(configDir, ".textlintrc");
            return configInit.initializeConfig(configDir).then(function(exitStatus) {
                assert.equal(exitStatus, 0);
                return loadConfig(configFile, {
                    configPackagePrefix: Config.CONFIG_PACKAGE_PREFIX,
                    configFileName: Config.CONFIG_FILE_NAME
                }).then(result => {
                    assert.equal(typeof result.filters, "object");
                    assert.equal(typeof result.rules, "object");
                    assert.deepEqual(result.filters, {
                        "comments": true
                    });
                    assert.deepEqual(result.rules, {
                        "eslint": true,
                        "prh": true,
                        "preset-ja-technical-writing": true
                    });
                });
            });
        });
    });
    context("when .textlintrc is not existed", function() {
        it("should create new file", function() {
            const configFile = path.join(configDir, ".textlintrc");
            return configInit.initializeConfig(configDir).then(function(exitStatus) {
                assert.equal(exitStatus, 0);
                return loadConfig(configFile, {
                    configPackagePrefix: Config.CONFIG_PACKAGE_PREFIX,
                    configFileName: Config.CONFIG_FILE_NAME
                }).then(result => {
                    assert.equal(typeof result.filters, "object");
                    assert.equal(typeof result.rules, "object");
                    assert(Object.keys(result.rules).length === 0);
                });
            });
        });
    });
    context("when .textlintrc is existed", function() {
        beforeEach(function() {
            // mock console API
            Logger.error = function mockErrorLog() {
            };
        });

        afterEach(function() {
            Logger.error = originErrorLog;
        });

        it("should be an error", function() {
            Logger.error = function mockErrorLog(message) {
                assert.equal(message, ".textlintrc is already existed.");
            };
            return configInit.initializeConfig(configDir).then((exitStatus) => {
                assert.equal(exitStatus, 0);
                // try to re-create
                return configInit.initializeConfig(configDir);
            }).then(exitStatus => {
                assert.equal(exitStatus, 1);
            });

        });
    });
});
