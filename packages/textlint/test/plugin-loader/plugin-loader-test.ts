// LICENSE : MIT
"use strict";
import assert from "node:assert";
import { describe, it } from "vitest";
import path from "node:path";
import { loadAvailableExtensions, getPluginConfig } from "../../src/DEPRECATED/config/plugin-loader.js";
import { TextLintModuleResolver } from "../../src/DEPRECATED/engine/textlint-module-resolver.js";

const moduleResolver = new TextLintModuleResolver({
    rulesBaseDirectory: path.join(__dirname, "fixtures")
});
describe("plugin-loader", function () {
    describe("#getPluginConfig", () => {
        it("should return {} when plugins is empty", () => {
            const pluginsConfig = getPluginConfig({});
            assert.deepStrictEqual(pluginsConfig, {});
        });

        it("should return { name: config } map when plugins is array", () => {
            const pluginsConfig = getPluginConfig({ plugins: ["a", "b"] });
            assert.deepStrictEqual(pluginsConfig, { a: true, b: true });
        });
        it("should return { name: config } map when plugins is object", () => {
            const setPluginsConfig = { a: { bFlag: "a" }, b: { bFlag: "b" } };
            const pluginsConfig = getPluginConfig({ plugins: setPluginsConfig });
            assert.deepStrictEqual(pluginsConfig, setPluginsConfig);
        });
    });
    describe("#loadAvailableExtensions", function () {
        describe("when the plugin has not {Processor}", function () {
            it("should return empty array", function () {
                const availableExtensions = loadAvailableExtensions(["has-not-processor"], moduleResolver);
                assert.equal(availableExtensions.length, 0);
            });
        });
        describe("when the plugin has {Processor}", function () {
            it("should return all [availableExtensions]", function () {
                const availableExtensions = loadAvailableExtensions(["has-processor-4-extensions"], moduleResolver);
                assert.equal(availableExtensions.length, 4);
                assert.ok(availableExtensions.indexOf(".test1") !== -1);
                assert.ok(availableExtensions.indexOf(".test2") !== -1);
                assert.ok(availableExtensions.indexOf(".test3") !== -1);
                assert.ok(availableExtensions.indexOf(".test4") !== -1);
            });
            it("should return [availableExtensions]", function () {
                const availableExtensions = loadAvailableExtensions(["has-processor"], moduleResolver);
                assert.equal(availableExtensions.length, 1);
                assert.equal(availableExtensions[0], ".test");
            });
        });
    });
});
