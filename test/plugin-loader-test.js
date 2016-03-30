// LICENSE : MIT
"use strict";
const assert = require("power-assert");
const path = require("path");
import Config from "../src/config/config";
import {loadRulesConfig, loadAvailableExtensions} from "../src/config/plugin-loader";
import TextLintModuleResolver from "../src/engine/textlint-module-resolver";
const moduleResolver = new TextLintModuleResolver(Config, path.join(__dirname, "fixtures/plugin-loader"));
describe("plugin-loader", function () {
    describe("#loadRulesConfig", function () {
        context("when the plugin has not {rulesConfig}", function () {
            it("should return empty object", function () {
                const rulesConfig = loadRulesConfig(["has-not-rulesconfig"], moduleResolver);
                assert.equal(Object.keys(rulesConfig).length, 0);
            });
        });
        context("when the plugin has {rulesConfig}", function () {
            it("should return {rulesConfig}", function () {
                const rulesConfig = loadRulesConfig(["has-rulesconfig"], moduleResolver);
                assert.equal(Object.keys(rulesConfig).length, 1);
            });
        });
        context("when both plugin exist", function () {
            it("should return {rulesConfig}", function () {
                const rulesConfig = loadRulesConfig(["has-not-rulesconfig", "has-rulesconfig"], moduleResolver);
                assert.equal(Object.keys(rulesConfig).length, 1);
            });
        });
    });
    describe("#loadAvailableExtensions", function () {
        context("when the plugin has not {Processor}", function () {
            it("should return empty array", function () {
                const availableExtensions = loadAvailableExtensions(["has-not-processor"], moduleResolver);
                assert.equal(availableExtensions.length, 0);
            });
        });
        context("when the plugin has {Processor}", function () {
            it("should return all [availableExtensions]", function () {
                const availableExtensions = loadAvailableExtensions(["has-processor-4-extensions"], moduleResolver);
                assert.equal(availableExtensions.length, 4);
                assert(availableExtensions.indexOf(".test1") !== -1);
                assert(availableExtensions.indexOf(".test2") !== -1);
                assert(availableExtensions.indexOf(".test3") !== -1);
                assert(availableExtensions.indexOf(".test4") !== -1);
            });
            it("should return [availableExtensions]", function () {
                const availableExtensions = loadAvailableExtensions(["has-processor"], moduleResolver);
                assert.equal(availableExtensions.length, 1);
                assert.equal(availableExtensions[0], ".test");
            });
        });
    });
});
