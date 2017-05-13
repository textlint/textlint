"use strict";
const assert = require("assert");
import { coreFlags, isFeatureEnabled, resetFlags, setFeature } from "../src/textlint-feature-flag";

describe("textlint-feature-flag", () => {
    beforeEach(() => {
        resetFlags();
    });
    describe("coreFlags", () => {
        it("should be false by default", () => {
            assert.ok(coreFlags.runningCLI === false);
            assert.ok(coreFlags.runningTester === false);
            assert.ok(coreFlags.experimental === false);
        });
        it("can set flag", () => {
            coreFlags.runningCLI = true;
            coreFlags.runningTester = true;
            coreFlags.experimental = true;
            assert.ok(coreFlags.runningCLI === true);
            assert.ok(coreFlags.runningTester === true);
            assert.ok(coreFlags.experimental === true);
        });
    });
    describe("feature-flag", () => {
        context("when default", () => {
            it("should throw error if the feature is not defined", () => {
                assert.throws(() => {
                    isFeatureEnabled("test");
                }, Error);
            });
            it("should return feature status", () => {
                setFeature("test", true);
                assert.ok(isFeatureEnabled("test") === true);

                setFeature("test", false);
                assert.ok(isFeatureEnabled("test") === false);
            });
        });
        context("when loose-mode", () => {
            it("should return false if the feature is not defined", () => {
                assert.strictEqual(isFeatureEnabled("test", {
                    loose: true
                }), false);
            });
        });
    });
});
