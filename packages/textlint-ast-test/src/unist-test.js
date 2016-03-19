// LICENSE : MIT
"use strict";
const assert = require("assert");
// https://github.com/wooorm/unist
export function isUnist(node) {
    try {
        test(node);
    } catch (error) {
        return false;
    }
    return true;
}
export function test(node) {
    assert.equal(typeof node, 'object');
    assert.equal(typeof node.type, 'string');
    assert.ok(node.type.length >= 1);

    assert.doesNotThrow(function () {
        JSON.parse(JSON.stringify(node));
    });

    if (node.children !== null && node.children !== undefined) {
        assert.ok(Array.isArray(node.children));
        node.children.forEach(test);
    }

    if (node.value !== null && node.value !== undefined) {
        assert.equal(typeof node.value, 'string');
    }

    const position = node.position;
    if (position !== null && position !== undefined) {
        assert.equal(typeof position, 'object');

        const start = position.start;
        const indent = position.indent;
        const end = position.end;

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

        if (indent !== null && indent !== undefined) {
            assert.ok(Array.isArray(indent));

            indent.forEach(function (indentation) {
                assert.equal(typeof indentation, 'number');
                assert.ok(indentation >= 0);
            });
        }
    }
}