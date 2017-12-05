import assert from "assert";
import { test, isTxtAST } from "../src/textlint-ast-test";
const txtParse = require("txt-to-ast").parse;
const markdownParse = require("markdown-to-ast").parse;
describe("textlint-ast-test", function() {
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
    context("when txt-to-ast", function() {
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
