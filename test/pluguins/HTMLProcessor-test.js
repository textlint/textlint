// LICENSE : MIT
"use strict";
import assert from "power-assert";
import HTMLProcessor from "../../src/plugins/html/HTMLProcessor";
import {parse} from "../../src/plugins/html/html-to-ast";
import {tagNameToType} from "../../src/plugins/html/mapping";
import {TextLintCore} from "../../src/index";
import path from "path";
describe("HTMLProcessor-test", function () {
    describe("#parse", function () {
        it("should return AST", function () {
            var result = parse(`<div><p><span>aaaa</span></p></div>`);
            assert(result.type === "Document");
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
                    "example-rule": require("../fixtures/rules/example-rule")
                });
            });
            it("should report error", function () {
                var fixturePath = path.join(__dirname, "/../fixtures/test.html");
                let results = textlint.lintFile(fixturePath);
                assert(results.messages.length > 0);
                assert(results.filePath === fixturePath);
            });
        });
    });
});