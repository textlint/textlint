// LICENSE : MIT
"use strict";
const assert = require("power-assert");
const path = require("path");
const os = require("os");
const sh = require("shelljs");
import Config from "../src/config/config";
import configInit from "../src/config/config-initializer";
import loadConfig from "../src/config/config-loader";
import Logger from "../src/util/logger";
/*
    config file generate test
 */
describe("config-initializer-test", function () {
    let configDir;
    const originErrorLog = Logger.error;

    before(function () {
        configDir = os.tmpdir() + "/textlint-config";
        sh.mkdir("-p", configDir);
    });

    after(function () {
        sh.rm("-r", configDir);
    });

    context("when .textlintrc is not existed", function () {
        it("should create new file", function () {
            const configFile = path.join(configDir, ".textlintrc");
            return configInit.initializeConfig(configDir).then(function (exitStatus) {
                assert.equal(exitStatus, 0);
                const result = loadConfig(configFile, {
                    configPackagePrefix: Config.CONFIG_PACKAGE_PREFIX,
                    configFileName: Config.CONFIG_FILE_NAME
                });
                assert.equal(typeof result.rules, "object");
                assert(Object.keys(result.rules).length === 0);
            });
        });
    });
    context("when .textlintrc is existed", function () {
        before(function () {
            // mock console API
            Logger.error = function mockErrorLog() {
            };
        });

        after(function () {
            Logger.error = originErrorLog;
        });

        it("should be an error", function () {
            Logger.error = function mockErrorLog(message) {
                assert.equal(message, ".textlintrc is already existed.");
            };
            return configInit.initializeConfig(configDir).then(function (result) {
                assert.equal(result, 1);
            });
        });
    });
});
