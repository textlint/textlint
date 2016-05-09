// LICENSE : MIT
"use strict";
import assert from "power-assert";
import HTMLProcessor from "../src/HTMLProcessor";
import {parse} from "../src/html-to-ast";
import {tagNameToType} from "../src/mapping";
import {TextLintCore} from "textlint";
import path from "path";
describe("HTMLProcessor-test", function () {
    describe("#parse", function () {
        it("should return AST", function () {
            const result = parse(`<div><p><span>aaaa</span></p></div>`);
            assert(result.type === "Document");
        });
        it("script should CodeBlock", function () {
            const result = parse(`<script> const a = 1; </script>`);
            const script = result.children[0];
            script.children.forEach(code => {
                assert.equal(code.type, "CodeBlock");
            });
        });
        it("<p> should Paragraph", function () {
            const result = parse(`<p>test</p>`);
            const pTag = result.children[0];
            assert.equal(pTag.type, "Paragraph");
        });
        it("<!-- comment --> should be Comment", function () {
            const result = parse(`<!-- comment -->`);
            const commentNode = result.children[0];
            assert.equal(commentNode.type, "Comment");
        });

        it("should map type to TxtNode's type", function () {
            function createTag(tagName) {
                return `<${tagName}></${tagName}>`;
            }

            function testMap(typeMap) {
                Object.keys(typeMap).forEach(tagName => {
                    const result = parse(createTag(tagName));
                    assert(result.type === "Document");
                    const firstChild = result.children[0];
                    const expectedType = typeMap[tagName];
                    assert.equal(firstChild.type, expectedType);
                });
            }

            testMap(tagNameToType);
        });
    });
    describe("HTMLPlugin", function () {
        let textlint;
        context("when target file is a HTML", function () {
            beforeEach(function () {
                textlint = new TextLintCore();
                textlint.setupProcessors({
                    HTMLProcessor: HTMLProcessor
                });
                textlint.setupRules({
                    "no-todo": require("textlint-rule-no-todo")
                });
            });
            it("should report error", function () {
                const fixturePath = path.join(__dirname, "/fixtures/test.html");
                return textlint.lintFile(fixturePath).then(results => {
                    assert(results.messages.length > 0);
                    assert(results.filePath === fixturePath);
                });
            });
        });
    });
});