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
    });
});
