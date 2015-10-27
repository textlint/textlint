// LICENSE : MIT
"use strict";
import assert from "power-assert";
import {parse} from "../../src/plugins/html/html-to-ast";
describe("HTMLProcessor-test", function () {
    describe("#parse", function () {
        it("should", function () {
            var result = parse(`<div><p><span>aaaa</span></p></div>`);
            console.log(JSON.stringify(result, null, 4));
            assert(false);
        });
    });
});