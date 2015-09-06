// LICENSE : MIT
"use strict";
var assert = require("power-assert");
var path = require("path");
var loadConfig = require("../lib/config/config-loader");
describe("config-loader", function () {
    it("should load config file", function () {
        var configFile = path.join(__dirname, "fixtures", ".textlintrc");
        var result = loadConfig(configFile);
        assert.equal(typeof result.rules["no-todo"], "object");
        assert(result.rules["no-todo"]["use-task-list"] === true);
    });
});