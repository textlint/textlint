// LICENSE : MIT
"use strict";
import * as assert from "node:assert";
import { TxtNode } from "@textlint/ast-node-types";
import { test as UnistTest } from "./unist-test.js";
import debug0 from "debug";

const debug = debug0("textlint/ast-tester");

const createMessage = ({ node, message }: { node: unknown; message: string }) => {
    return `${message}\n${JSON.stringify(node, null, 4)}`;
};

export function isTxtAST(node: unknown): node is TxtNode {
    try {
        test(node as Record<string, unknown>);
    } catch (error) {
        debug("This is not TxtAST", error);
        return false;
    }
    return true;
}

export function test(node: Record<string, unknown>) {
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
        (node.type as string).length >= 1,
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
    const loc = node.loc as Record<string, unknown>;
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
    const start = loc.start as Record<string, unknown> | null | undefined;
    const end = loc.end as Record<string, unknown> | null | undefined;
    if (start !== null && start !== undefined) {
        assert.strictEqual(typeof start, "object");

        if (start.line !== null && start.line !== undefined) {
            assert.strictEqual(typeof start.line, "number");
            assert.ok((start.line as number) >= 0); // allow `0` for `null`.
        }

        if (start.column !== null && start.column !== undefined) {
            assert.strictEqual(typeof start.column, "number");
            assert.ok((start.column as number) >= 0); // allow `0` for `null`.
        }

        if (start.offset !== null && start.offset !== undefined) {
            assert.strictEqual(typeof start.offset, "number");
            assert.ok((start.offset as number) >= 0);
        }
    }

    if (end !== null && end !== undefined) {
        assert.strictEqual(typeof end, "object");

        if (end.line !== null && end.line !== undefined) {
            assert.strictEqual(typeof end.line, "number");
            assert.ok((end.line as number) >= 0); // allow `0` for `null`.
        }

        if (end.column !== null && end.column !== undefined) {
            assert.strictEqual(typeof end.column, "number");
            assert.ok((end.column as number) >= 0); // allow `0` for `null`.
        }

        if (end.offset !== null && end.offset !== undefined) {
            assert.strictEqual(typeof end.offset, "number");
            assert.ok((end.offset as number) >= 0);
        }
    }
    // range
    const range = node.range as number[];
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
