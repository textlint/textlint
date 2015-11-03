// LICENSE : MIT
"use strict";
var assert = require("power-assert");
var path = require("path");
var loadConfig = require("../src/config/config-loader");
var Config = require("../src/config/config");
describe("config-loader", function () {
    it("should load config file", function () {
        var configFile = path.join(__dirname, "fixtures", ".textlintrc");
        var result = loadConfig(configFile, {
            configFileName: Config.CONFIG_FILE_NAME,
            configPackagePrefix: Config.CONFIG_PACKAGE_PREFIX
        });
        assert.equal(typeof result.rules["no-todo"], "object");
        assert(result.rules["no-todo"]["use-task-list"] === true);
    });
});