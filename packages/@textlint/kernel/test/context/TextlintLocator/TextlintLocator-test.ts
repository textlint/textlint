import { TxtNode } from "@textlint/ast-node-types";
import { TextlintSourceCodeImpl } from "../../../src/context/TextlintSourceCodeImpl";

import { parse } from "@textlint/markdown-to-ast";
import { createLocator } from "../../../src/context/TextlintRuleLocator";
import * as assert from "assert";

const TEST_TEXT = "This is **strong**.\n2nd line.";
const TEST_AST = parse(TEST_TEXT);
const createSourceCode = (text: string, ast: TxtNode) => {
    return new TextlintSourceCodeImpl({
        text: text,
        ast: ast,
        ext: ".md"
    });
};
describe("TextlintLocator", () => {
    describe("at(index)", function () {
        it("should return Location object", () => {
            const sourceCode = createSourceCode(TEST_TEXT, TEST_AST);
            const locator = createLocator(sourceCode);
            assert.deepStrictEqual(locator.at(0), {
                isAbsolute: false,
                range: [0, 1]
            });
        });
    });
    describe("range([start, end])", function () {
        it("should return Location object", () => {
            const sourceCode = createSourceCode(TEST_TEXT, TEST_AST);
            const locator = createLocator(sourceCode);
            assert.deepStrictEqual(locator.range([0, 5]), {
                isAbsolute: false,
                range: [0, 5]
            });
        });
    });
    describe("loc(location)", function () {
        it("should return Location object", () => {
            const sourceCode = createSourceCode(TEST_TEXT, TEST_AST);
            const locator = createLocator(sourceCode);
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
                    isAbsolute: false,
                    range: [21, 25]
                }
            );
        });
    });
});
