import { createPaddingLocator } from "../../../src/context/TextlintRulePaddingLocator";
import * as assert from "assert";

describe("TextlintLocator", () => {
    describe("at(index)", function () {
        it("should return Location object", () => {
            const locator = createPaddingLocator();
            assert.deepStrictEqual(locator.at(0), {
                type: "TextlintRuleErrorPaddingLocation",
                isAbsolute: false,
                range: [0, 1]
            });
        });
    });
    describe("range([start, end])", function () {
        it("should return Location object", () => {
            const locator = createPaddingLocator();
            assert.deepStrictEqual(locator.range([0, 5]), {
                type: "TextlintRuleErrorPaddingLocation",
                isAbsolute: false,
                range: [0, 5]
            });
        });
        it("should throw when passed invalid range", () => {
            const locator = createPaddingLocator();
            assert.throws(() => {
                // @ts-ignore
                locator.range([1, 2, 3, 4]);
            }, "range must be [start, end]");
        });
        it("should throw when passed NaN", () => {
            const locator = createPaddingLocator();
            assert.throws(() => {
                locator.range([NaN, NaN]);
            }, /range must not be NaN/);
        });
        it("should throw when passed same range", () => {
            const locator = createPaddingLocator();
            assert.throws(() => {
                locator.range([0, 0]);
            }, /range must not be same/);
        });
    });
    describe("loc(location)", function () {
        it("should return Location object", () => {
            const locator = createPaddingLocator();
            assert.deepStrictEqual(
                locator.loc({
                    start: {
                        line: 2,
                        column: 1
                    },
                    end: {
                        line: 2,
                        column: 5
                    }
                }),
                {
                    type: "TextlintRuleErrorPaddingLocation",
                    isAbsolute: false,
                    loc: {
                        start: {
                            line: 2,
                            column: 1
                        },
                        end: {
                            line: 2,
                            column: 5
                        }
                    }
                }
            );
        });
        it("should throw when passed invalid Location object", () => {
            const locator = createPaddingLocator();
            assert.throws(() => {
                locator.loc({
                    // @ts-ignore
                    line: 2,
                    // @ts-ignore
                    column: 1
                });
            }, /loc must be/);
        });
        it("should throw when passed invalid Location property is NaN", () => {
            const locator = createPaddingLocator();
            assert.throws(() => {
                locator.loc({
                    start: {
                        line: NaN,
                        column: NaN
                    },
                    end: {
                        line: NaN,
                        column: NaN
                    }
                });
            }, /loc must be/);
        });
    });
});
