// LICENSE : MIT
"use strict";
const assert = require("power-assert");
const path = require("path");
import loadConfig from "../src/config/config-loader";
import Config from "../src/config/config";
describe("config-loader", function () {
    it("should load config file", function () {
        const configFile = path.join(__dirname, "fixtures", "config-loader", ".textlintrc");
        const result = loadConfig(configFile, {
            configFileName: Config.CONFIG_FILE_NAME,
            configPackagePrefix: Config.CONFIG_PACKAGE_PREFIX
        });
        assert.equal(typeof result.rules["no-todo"], "object");
        assert(result.rules["no-todo"]["use-task-list"] === true);
    });
});
