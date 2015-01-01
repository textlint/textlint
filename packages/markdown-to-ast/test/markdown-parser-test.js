// LICENSE : MIT
"use strict";
var assert = require("power-assert");
var parse = require("../");
var Syntax = require("../lib/markdown/markdown-syntax");

/*
    NOTE:
        `line` start with 1
        `column` start with 0

 */
describe("markdown-parser", function () {
    context('Node type is "Document"', function () {
        it("should has implemented TxtNode", function () {
            var RootDocument = parse("");
            assert.equal(RootDocument.type, Syntax.Document);
            assert.deepEqual(RootDocument.loc, {
                start: {
                    line: 1,
                    column: 0
                },
                end: {
                    line: 1,
                    column: 0
                }
            });
        });
    })
});