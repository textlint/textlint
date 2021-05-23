// LICENSE : MIT
"use strict";
import * as assert from "assert";
import { TxtNode } from "@textlint/ast-node-types";
import { test as UnistTest } from "./unist-test";
import debug0 from "debug";

const debug = debug0("textlint/ast-tester");

const createMessage = ({ node, message }: { node: any; message: string }) => {
    return `${message}\n${JSON.stringify(node, null, 4)}`;
};

export function isTxtAST(node: any): node is TxtNode {
    try {
        test(node);
    } catch (error) {
        debug("This is not TxtAST", error);
        return false;
    }
    return true;
}

export function test(node: any) {
    // test unist that is weak.
    UnistTest(node);
    assert.strictEqual(
        typeof node,
        "object",
        createMessage({
            message: `invalid node: node should be object`,
            node
        })
    );
    assert.strictEqual(
        typeof node.type,
        "string",
        createMessage({
            message: `invalid type: type should be string`,
            node
        })
    );
    assert.ok(
        node.type.length >= 1,
        createMessage({
            message: `invalid type: type is empty string`,
            node
        })
    );
    assert.doesNotThrow(
        function () {
            JSON.parse(JSON.stringify(node));
        },
        createMessage({
            message: `invalid node: node should be serializable`,
            node
        })
    );

    // children
    if (node.children !== null && node.children !== undefined) {
        assert.ok(
            Array.isArray(node.children),
            createMessage({
                message: `invalid children: children should be an array`,
                node
            })
        );
        node.children.forEach(test);
    }

    // value
    if (node.value !== null && node.value !== undefined) {
        assert.strictEqual(
            typeof node.value,
            "string",
            createMessage({
                message: `invalid value: value should be string`,
                node
            })
        );
    }
    // raw
    assert.ok(
        node.raw !== null && node.raw !== undefined,
        createMessage({
            message: `invalid raw: raw is undefined`,
            node
        })
    );
    assert.strictEqual(
        typeof node.raw,
        "string",
        createMessage({
            message: `invalid raw: raw is not string`,
            node
        })
    );
    // loc
    const loc = node.loc;
    assert.ok(
        loc !== null && loc !== undefined,
        createMessage({
            message: `invalid loc: node.loc is undefined`,
            node
        })
    );
    assert.strictEqual(
        typeof loc,
        "object",
        createMessage({
            message: `invalid loc: node.loc should be object. it should have { start, end } property`,
            node
        })
    );
    const start = loc.start;
    const end = loc.end;
    if (start !== null && start !== undefined) {
        assert.strictEqual(typeof start, "object");

        if (start.line !== null && start.line !== undefined) {
            assert.strictEqual(typeof start.line, "number");
            assert.ok(start.line >= 0); // allow `0` for `null`.
        }

        if (start.column !== null && start.column !== undefined) {
            assert.strictEqual(typeof start.column, "number");
            assert.ok(start.column >= 0); // allow `0` for `null`.
        }

        if (start.offset !== null && start.offset !== undefined) {
            assert.strictEqual(typeof start.offset, "number");
            assert.ok(start.offset >= 0);
        }
    }

    if (end !== null && end !== undefined) {
        assert.strictEqual(typeof end, "object");

        if (end.line !== null && end.line !== undefined) {
            assert.strictEqual(typeof end.line, "number");
            assert.ok(end.line >= 0); // allow `0` for `null`.
        }

        if (end.column !== null && end.column !== undefined) {
            assert.strictEqual(typeof end.column, "number");
            assert.ok(end.column >= 0); // allow `0` for `null`.
        }

        if (end.offset !== null && end.offset !== undefined) {
            assert.strictEqual(typeof end.offset, "number");
            assert.ok(end.offset >= 0);
        }
    }
    // range
    const range = node.range;
    assert.ok(
        range !== null && range !== undefined,
        createMessage({
            message: `invalid range: range should be an array`,
            node
        })
    );
    assert.ok(
        Array.isArray(range),
        createMessage({
            message: `invalid range: range should be an array`,
            node
        })
    );
    range.forEach(function (index: number) {
        assert.strictEqual(
            typeof index,
            "number",
            createMessage({
                message: `invalid index: index should be number`,
                node
            })
        );
        assert.ok(
            index >= 0,
            createMessage({
                message: `invalid index: index >= 0`,
                node
            })
        );
    });
    assert.ok(
        range[0] <= range[1],
        createMessage({
            message: `invalid range: range[0] should be less than range[1]`,
            node
        })
    );
}
