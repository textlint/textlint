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
            var result = parse(`<div><p><span>aaaa</span></p></div>`);
            assert(result.type === "Document");
        });
        it("script should CodeBlock", function () {
            var result = parse(`<script> var a = 1; </script>`);
            let script = result.children[0];
            script.children.forEach(code => {
                assert.equal(code.type, "CodeBlock");
            });
        });
        it("<p> should Paragraph", function () {
            var result = parse(`<p>test</p>`);
            let pTag = result.children[0];
            assert.equal(pTag.type, "Paragraph");
        });
        it("should map type to TxtNode's type", function () {
            function createTag(tagName) {
                return `<${tagName}></${tagName}>`;
            }

            function testMap(typeMap) {
                Object.keys(typeMap).forEach(tagName => {
                    let result = parse(createTag(tagName));
                    assert(result.type === "Document");
                    let firstChild = result.children[0];
                    let expectedType = typeMap[tagName];
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
                textlint.addProcessor(HTMLProcessor);
                textlint.setupRules({
                    "no-todo": require("textlint-rule-no-todo")
                });
            });
            it("should report error", function () {
                var fixturePath = path.join(__dirname, "/fixtures/test.html");
                let results = textlint.lintFile(fixturePath);
                assert(results.messages.length > 0);
                assert(results.filePath === fixturePath);
            });
        });
    });
});