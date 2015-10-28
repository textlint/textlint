// LICENSE : MIT
"use strict";
import assert from "power-assert";
import {parse} from "../../src/plugins/html/html-to-ast";
import { tagNameToType } from "../../src/plugins/html/mapping";
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
});