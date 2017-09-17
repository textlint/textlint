// LICENSE : MIT
"use strict";
const path = require("path");
import assert from "power-assert";
import TextLintModuleResolver from "../../src/engine/textlint-module-resolver";
import Config from "../../src/config/config";
const FIXTURE_DIR = path.join(__dirname, "fixtures");
const createResolve = ruleBaseDir => {
    return new TextLintModuleResolver(Config, ruleBaseDir);
};
describe("textlint-module-resolver", function() {
    describe("#resolveRulePackageName", function() {
        it("should resolve rule package name", function() {
            const resolver = createResolve();
            const shortPkg = resolver.resolveRulePackageName("no-todo");
            assert.equal(typeof shortPkg, "string");
            const longPkg = resolver.resolveRulePackageName("textlint-rule-no-todo");
            assert.equal(typeof longPkg, "string");
            assert.equal(shortPkg, longPkg);
        });
        it("should resolve rule file path", function() {
            const resolver = createResolve(FIXTURE_DIR);
            const packageName = "rule";
            const modulePath = resolver.resolveRulePackageName(packageName);
            assert.equal(typeof modulePath, "string");
            assert.equal(modulePath, path.resolve(FIXTURE_DIR, packageName + ".js"));
        });
        it("Not found, throw error", function() {
            const resolver = createResolve(FIXTURE_DIR);
            const packageName = "NOT_FOUND_FILE";
            assert.throws(() => {
                resolver.resolveRulePackageName(packageName);
            }, /Failed to load textlint's rule module/);
        });
    });
    describe("#resolveFilterRulePackageName", function() {
        it("should resolve rule file path", function() {
            const resolver = createResolve(FIXTURE_DIR);
            const packageName = "filter-rule";
            const modulePath = resolver.resolveFilterRulePackageName(packageName);
            assert.equal(typeof modulePath, "string");
            assert.equal(modulePath, path.resolve(FIXTURE_DIR, packageName + ".js"));
        });
        it("Not found, throw error", function() {
            const resolver = createResolve(FIXTURE_DIR);
            const packageName = "NOT_FOUND_FILE";
            assert.throws(() => {
                resolver.resolveFilterRulePackageName(packageName);
            }, /Failed to load textlint's filter rule module/);
        });
    });
    describe("#resolvePluginPackageName", function() {
        it("should resolve plugin package name", function() {
            const resolver = createResolve();
            const shortPkg = resolver.resolvePluginPackageName("text");
            assert.equal(typeof shortPkg, "string");
            const longPkg = resolver.resolvePluginPackageName("textlint-plugin-text");
            assert.equal(typeof longPkg, "string");
            assert.equal(shortPkg, longPkg);
        });
        it("should resolve plugin file path", function() {
            const resolver = createResolve(FIXTURE_DIR);
            const packageName = "plugin";
            const modulePath = resolver.resolvePluginPackageName(packageName);
            assert.equal(typeof modulePath, "string");
            assert.equal(modulePath, path.resolve(FIXTURE_DIR, packageName + ".js"));
        });
        it("Not found, throw error", function() {
            const resolver = createResolve(FIXTURE_DIR);
            const packageName = "NOT_FOUND_FILE";
            assert.throws(() => {
                resolver.resolvePluginPackageName(packageName);
            }, /Failed to load textlint's plugin module/);
        });
    });
    describe("#resolvePresetPackageName", function() {
        context("In Configuration", function() {
            /*
             {
             "rules": {
             "preset-gizmo": {
             "ruleA": false
             }
             }
             }
             */
            it("should resolve plugin package name", function() {
                const resolver = createResolve();
                const shortPkg = resolver.resolvePresetPackageName("preset-jtf-style");
                assert.equal(typeof shortPkg, "string");
                const longPkg = resolver.resolvePresetPackageName("textlint-rule-preset-jtf-style");
                assert.equal(typeof longPkg, "string");
                assert.equal(shortPkg, longPkg);
            });
        });
        it("should resolve plugin package name", function() {
            const resolver = createResolve();
            const shortPkg = resolver.resolvePresetPackageName("jtf-style");
            assert.equal(typeof shortPkg, "string");
            const longPkg = resolver.resolvePresetPackageName("textlint-rule-preset-jtf-style");
            assert.equal(typeof longPkg, "string");
            assert.equal(shortPkg, longPkg);
        });
        it("should resolve plugin file path", function() {
            const resolver = createResolve(FIXTURE_DIR);
            const packageName = "preset";
            const modulePath = resolver.resolvePresetPackageName(packageName);
            assert.equal(typeof modulePath, "string");
            assert.equal(modulePath, path.resolve(FIXTURE_DIR, packageName + ".js"));
        });
        it("Not found, throw error", function() {
            const resolver = createResolve(FIXTURE_DIR);
            const packageName = "NOT_FOUND_FILE";
            assert.throws(() => {
                resolver.resolvePresetPackageName(packageName);
            }, /Failed to load textlint's preset module/);
        });
    });
    describe("#resolveConfigPackageName", function() {
        it("should resolve config package name", function() {
            const resolver = createResolve();
            // TODO: should be prepare real config module
            assert.throws(() => {
                resolver.resolveConfigPackageName("azu");
            });
        });
        it("should resolve scoped config package name", function() {
            const resolver = createResolve(FIXTURE_DIR);
            const modulePath = resolver.resolveConfigPackageName("@textlint/textlint-config-example");
            assert.equal(typeof modulePath, "string");
            assert.equal(modulePath, path.resolve(FIXTURE_DIR, "@textlint/textlint-config-example/index.js"));
        });
        it("should resolve config file path", function() {
            const resolver = createResolve(FIXTURE_DIR);
            const packageName = "config";
            const modulePath = resolver.resolveConfigPackageName(packageName);
            assert.equal(typeof modulePath, "string");
            assert.equal(modulePath, path.resolve(FIXTURE_DIR, packageName + ".js"));
        });
        it("Not found, throw error", function() {
            const resolver = createResolve(FIXTURE_DIR);
            const packageName = "NOT_FOUND_FILE";
            assert.throws(() => {
                resolver.resolveConfigPackageName(packageName);
            }, /Failed to load textlint's config module/);
        });
    });
});
