// LICENSE : MIT
'use strict';
var assert = require("power-assert");
var Config = require("../src/config/config");
var configInit = require("../src/config/config-initializer");
var loadConfig = require("../src/config/config-loader");
var path = require("path");
var os = require("os");
var sh = require("shelljs");

/*
    config file generate test
 */
describe("config-initializer-test", function () {
    var configDir;
    let originErrorLog = console.error;

    before(function() {
        configDir = os.tmpdir() + "/textlint-config";
        sh.mkdir("-p", configDir);
    });

    after(function() {
        sh.rm("-r", configDir);
    });

    context("when .textlintrc is not existed", function () {
        it("should create new file", function() {
            configInit.initializeConfig(configDir).then(function(result){
                assert.equal(result, 0);
            });
            var configFile = path.join(configDir, ".textlintrc");
            var result = loadConfig(configFile, {
                configPackagePrefix: Config.CONFIG_PACKAGE_PREFIX,
                configFileName: Config.CONFIG_FILE_NAME
            });
            assert.equal(typeof result.rules, "object");
            assert(Object.keys(result.rules).length === 0);
        });
    });
    context("when .textlintrc is existed", function () {
        before(function(){
            // mock console API
            console.error = function mockErrorLog() {
            }
        });

        after(function() {
            console.error = originErrorLog;
        });

        it("should be an error", function() {
            console.error = function mockErrorLog(message) {
                assert.equal(message, ".textlintrc is already existed.");
            };
            configInit.initializeConfig(configDir).then(function(result) {
                assert.equal(result, 1);
            });
        });
    });
});
