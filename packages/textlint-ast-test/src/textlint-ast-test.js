// LICENSE : MIT
"use strict";
const assert = require("power-assert");
import {test as UnistTest} from "./unist-test";
export function isTextlintAST(node) {
    try {
        test(node);
    } catch (error) {
        return false;
    }
    return true;
}
export function test(node) {
    // test unist that is weak.
    UnistTest(node);
    assert.equal(typeof node, 'object');
    assert.equal(typeof node.type, 'string');
    assert.ok(node.type.length >= 1);

    assert.doesNotThrow(function () {
        JSON.parse(JSON.stringify(node));
    });

    // children
    if (node.children !== null && node.children !== undefined) {
        assert.ok(Array.isArray(node.children));
        node.children.forEach(test);
    }

    // value
    if (node.value !== null && node.value !== undefined) {
        assert.equal(typeof node.value, 'string');
    }
    // raw
    assert(node.raw !== null && node.raw !== undefined);
    assert.equal(typeof node.raw, 'string');
    // loc
    const loc = node.loc;
    assert(loc !== null && loc !== undefined);
    assert.equal(typeof loc, 'object');
    const start = loc.start;
    const end = loc.end;
    if (start !== null && start !== undefined) {
        assert.equal(typeof start, 'object');

        if (start.line !== null && start.line !== undefined) {
            assert.equal(typeof start.line, 'number');
            assert.ok(start.line >= 0); // allow `0` for `null`.
        }

        if (start.column !== null && start.column !== undefined) {
            assert.equal(typeof start.column, 'number');
            assert.ok(start.column >= 0); // allow `0` for `null`.
        }

        if (start.offset !== null && start.offset !== undefined) {
            assert.equal(typeof start.offset, 'number');
            assert.ok(start.offset >= 0);
        }
    }

    if (end !== null && end !== undefined) {
        assert.equal(typeof end, 'object');

        if (end.line !== null && end.line !== undefined) {
            assert.equal(typeof end.line, 'number');
            assert.ok(end.line >= 0); // allow `0` for `null`.
        }

        if (end.column !== null && end.column !== undefined) {
            assert.equal(typeof end.column, 'number');
            assert.ok(end.column >= 0); // allow `0` for `null`.
        }

        if (end.offset !== null && end.offset !== undefined) {
            assert.equal(typeof end.offset, 'number');
            assert.ok(end.offset >= 0);
        }
    }
    // range
    const range = node.range;
    assert(range !== null && range !== undefined);
    assert.ok(Array.isArray(range));
    range.forEach(function (index) {
        assert.equal(typeof index, 'number');
        assert.ok(index >= 0);
    });
    assert(range[0] <= range[1]);

}