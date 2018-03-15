import * as assert from "assert";
import { test, isTxtAST } from "../src/textlint-ast-tester";
const txtParse = require("@textlint/text-to-ast").parse;
const markdownParse = require("@textlint/markdown-to-ast").parse;
describe("@textlint/ast-tester", function() {
    context("when markdown-to-ast", function() {
        it("should not throw", function() {
            const text = `This is text.
これはテキストです。
This is ⏩ emoji

- List
`;

            const AST = txtParse(text);
            test(AST);
            assert(isTxtAST(AST));
        });
    });
    context("when @textlint/text-to-ast", function() {
        it("should not throw", function() {
            const text = `This is text.
これはテキストです。
This is ⏩ emoji

- List

-------

    quote
`;
            const AST = markdownParse(text);
            test(AST);
            assert(isTxtAST(AST));
        });
    });

    context("when invalid case", function() {
        it("should not throw", function() {
            assert.throws(function() {
                test({
                    type: "string"
                });
            });
            assert(!isTxtAST({}));
        });
    });
});
