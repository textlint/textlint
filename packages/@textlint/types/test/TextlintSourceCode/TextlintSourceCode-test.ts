import * as assert from "assert";
import { TxtNode, TxtParentNode } from "@textlint/ast-node-types";
import { TextlintSourceCode } from "../../src/";

const select = require("unist-util-select");
const { parse } = require("@textlint/markdown-to-ast");
const TEST_TEXT = "This is **strong**.";
const TEST_AST = parse(TEST_TEXT);
const createSourceCode = (text: string, ast: TxtParentNode) => {
    return new TextlintSourceCode({
        text: text,
        ast: ast,
        ext: ".md"
    });
};
describe("SourceCode", () => {
    describe("#getSource", () => {
        it("should return all text when no arguments", () => {
            const sourceCode = createSourceCode(TEST_TEXT, TEST_AST);
            assert.strictEqual(sourceCode.getSource(), TEST_TEXT);
        });
        it("should return text for root node", () => {
            const sourceCode = createSourceCode(TEST_TEXT, TEST_AST);
            assert.strictEqual(sourceCode.getSource(TEST_AST), TEST_TEXT);
        });
        it("should clamp to valid range when retrieving characters before start of source", () => {
            const sourceCode = createSourceCode(TEST_TEXT, TEST_AST);
            const text = sourceCode.getSource(TEST_AST, 2, 0);
            assert.strictEqual(text, TEST_TEXT);
        });

        it("should clamp to valid range when retrieving characters after start of source", () => {
            const sourceCode = createSourceCode(TEST_TEXT, TEST_AST);
            const text = sourceCode.getSource(TEST_AST, 0, 2);
            assert.strictEqual(text, TEST_TEXT);
        });
        it("should retrieve all text for Strong node", () => {
            const sourceCode = createSourceCode(TEST_TEXT, TEST_AST);
            const StrongNode: TxtNode = select.one(TEST_AST, "Strong");
            const text = sourceCode.getSource(StrongNode);
            assert.strictEqual(text, "**strong**");
            assert.strictEqual(text, StrongNode.raw);
        });

        it("should retrieve retrieve all text +1 character after for  bold node", () => {
            const sourceCode = createSourceCode(TEST_TEXT, TEST_AST);
            const StrongNode: TxtNode = select.one(TEST_AST, "Strong");
            const text = sourceCode.getSource(StrongNode, 0, 1);
            assert.strictEqual(text, "**strong**.");
        });

        it("should retrieve retrieve all text +1 character before for  bold node", () => {
            const sourceCode = createSourceCode(TEST_TEXT, TEST_AST);
            const StrongNode: TxtNode = select.one(TEST_AST, "Strong");
            const text = sourceCode.getSource(StrongNode, 1, 0);
            assert.strictEqual(text, " **strong**");
        });
    });
});
