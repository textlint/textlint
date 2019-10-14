"use strict";
import assert from "assert";
import {
    coreFlags,
    isFeatureEnabled,
    resetFlags,
    setFeature,
    throwIfTesting,
    throwWithoutExperimental
} from "../src/index";

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
                assert.strictEqual(isFeatureEnabled("test", { loose: true }), false);
            });
        });
    });
    describe("#throwWithoutExperimental", () => {
        it("should not throw if is experiment", () => {
            coreFlags.experimental = true;
            throwWithoutExperimental("this is not experimental");
            assert.ok(true);
        });
        it("should throw if is not experiment and running CLI", () => {
            coreFlags.runningCLI = true;
            coreFlags.experimental = false;
            assert.throws(() => {
                throwWithoutExperimental("this is not experimental");
            }, Error);
        });
    });
    describe("#throwIfTesting", () => {
        it("should not throw if is not testing", () => {
            coreFlags.runningTester = false;
            throwIfTesting("this is not testing");
            assert.ok(true);
        });
        it("should throw if is testing", () => {
            coreFlags.runningTester = true;
            assert.throws(() => {
                throwIfTesting("this is testing");
            }, Error);
        });
    });
});
