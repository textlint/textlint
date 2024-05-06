// LICENSE : MIT
"use strict";
import { createConfigFile } from "../../src/config/config-initializer";
import { Logger } from "../../src/util/logger";
import path from "path";
import os from "os";
import sh from "shelljs";
import assert from "assert";
import fs from "fs";

describe("config-initializer-test", function () {
    let configDir: string;
    const originErrorLog = Logger.error;

    beforeEach(function () {
        configDir = `${os.tmpdir()}/textlint-config`;
        sh.mkdir("-p", configDir);
    });

    afterEach(function () {
        sh.rm("-r", configDir);
    });
    context("when package.json has textlint-rule-* packages", function () {
        beforeEach(function () {
            const packageFilePath = path.join(__dirname, "fixtures", "package.json");
            sh.cp(packageFilePath, configDir);
        });
        it("should create new file with packages", function () {
            return createConfigFile({
                dir: configDir,
                verbose: false
            }).then(function (exitStatus) {
                assert.strictEqual(exitStatus, 0);
                const config = JSON.parse(fs.readFileSync(path.join(configDir, ".textlintrc.json"), "utf-8"));
                assert.equal(typeof config.filters, "object");
                assert.equal(typeof config.rules, "object");
                assert.equal(typeof config.plugins, "object");
                assert.deepEqual(config.filters, { comments: true });
                assert.deepEqual(config.rules, { eslint: true, prh: true, "preset-ja-technical-writing": true });
                assert.deepEqual(config.plugins, { html: true });
            });
        });
    });
    context("when .textlintrc is not existed", function () {
        it("should create new file", function () {
            return createConfigFile({
                dir: configDir,
                verbose: false
            }).then(function (exitStatus) {
                assert.strictEqual(exitStatus, 0);
                const config = JSON.parse(fs.readFileSync(path.join(configDir, ".textlintrc.json"), "utf-8"));
                assert.strictEqual(typeof config.filters, "object");
                assert.strictEqual(typeof config.rules, "object");
                assert.strictEqual(typeof config.plugins, "object");
                assert.ok(Object.keys(config.rules).length === 0);
            });
        });
        it("should create and show message if verbose:true", function () {
            Logger.log = function mockErrorLog(message) {
                assert.ok(/\.textlintrc.json is created/.test(message), "should show created message");
            };
            return createConfigFile({
                dir: configDir,
                verbose: true
            }).then(function (exitStatus) {
                assert.equal(exitStatus, 0);
            });
        });
    });
    context("when .textlintrc is existed", function () {
        beforeEach(function () {
            // mock console API
            Logger.error = function mockErrorLog() {};
        });

        afterEach(function () {
            Logger.error = originErrorLog;
        });

        it("should be an error", function () {
            Logger.error = function mockErrorLog(message) {
                assert.equal(message, ".textlintrc.json is already existed.");
            };
            return createConfigFile({
                dir: configDir,
                verbose: false
            })
                .then((exitStatus) => {
                    assert.equal(exitStatus, 0);
                    // try to re-create
                    return createConfigFile({
                        dir: configDir,
                        verbose: false
                    });
                })
                .then((exitStatus) => {
                    assert.equal(exitStatus, 1);
                });
        });
    });
});
