// LICENSE : MIT
"use strict";
import { TextLintModuleResolver } from "../../src/engine/textlint-module-resolver";

const assert = require("assert");
const path = require("path");
const os = require("os");
const sh = require("shelljs");
import { Config } from "../../src/config/config";
import { createConfigFile } from "../../src/config/config-initializer";
import { loadConfig } from "../../src/config/config-loader";
import { Logger } from "../../src/util/logger";
/*
 config file generate test
 */
describe("config-initializer-test", function() {
    let configDir: string;
    const originErrorLog = Logger.error;

    beforeEach(function() {
        configDir = `${os.tmpdir()}/textlint-config`;
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
            const moduleResolver = new TextLintModuleResolver(Config, configDir);
            return createConfigFile({
                dir: configDir,
                verbose: false
            }).then(function(exitStatus) {
                assert.equal(exitStatus, 0);
                const { config } = loadConfig(configFile, {
                    moduleResolver,
                    configFileName: Config.CONFIG_FILE_NAME
                });
                assert.equal(typeof config.filters, "object");
                assert.equal(typeof config.rules, "object");
                assert.deepEqual(config.filters, { comments: true });
                assert.deepEqual(config.rules, { eslint: true, prh: true, "preset-ja-technical-writing": true });
            });
        });
    });
    context("when .textlintrc is not existed", function() {
        it("should create new file", function() {
            const configFile = path.join(configDir, ".textlintrc");
            const moduleResolver = new TextLintModuleResolver(Config, configDir);

            return createConfigFile({
                dir: configDir,
                verbose: false
            }).then(function(exitStatus) {
                assert.equal(exitStatus, 0);
                const { config } = loadConfig(configFile, {
                    moduleResolver,
                    configFileName: Config.CONFIG_FILE_NAME
                });
                assert.equal(typeof config.filters, "object");
                assert.equal(typeof config.rules, "object");
                assert(Object.keys(config.rules).length === 0);
            });
        });
        it("should create and show message if verbose:true", function() {
            Logger.log = function mockErrorLog(message) {
                assert.ok(/\.textlintrc is created/.test(message), "should show created message");
            };
            return createConfigFile({
                dir: configDir,
                verbose: true
            }).then(function(exitStatus) {
                assert.equal(exitStatus, 0);
            });
        });
    });
    context("when .textlintrc is existed", function() {
        beforeEach(function() {
            // mock console API
            Logger.error = function mockErrorLog() {};
        });

        afterEach(function() {
            Logger.error = originErrorLog;
        });

        it("should be an error", function() {
            Logger.error = function mockErrorLog(message) {
                assert.equal(message, ".textlintrc is already existed.");
            };
            return createConfigFile({
                dir: configDir,
                verbose: false
            })
                .then(exitStatus => {
                    assert.equal(exitStatus, 0);
                    // try to re-create
                    return createConfigFile({
                        dir: configDir,
                        verbose: false
                    });
                })
                .then(exitStatus => {
                    assert.equal(exitStatus, 1);
                });
        });
    });
});
