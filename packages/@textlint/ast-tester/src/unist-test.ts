// LICENSE : MIT
"use strict";
import * as assert from "node:assert";

// https://github.com/wooorm/unist
export function isUnist(node: unknown): boolean {
    try {
        test(node as Record<string, unknown>);
    } catch (error) {
        return false;
    }
    return true;
}

export function test(node: Record<string, unknown>) {
    assert.doesNotThrow(function () {
        JSON.parse(JSON.stringify(node));
    });
    // Walk with a stack, because the depth of the tree depends on the document
    const stack: Record<string, unknown>[] = [node];
    while (stack.length > 0) {
        const current = stack.pop() as Record<string, unknown>;
        testNode(current);
        const children = current.children as Record<string, unknown>[] | null | undefined;
        if (children !== null && children !== undefined) {
            for (let i = children.length - 1; i >= 0; i--) {
                stack.push(children[i]);
            }
        }
    }
}

/**
 * Test a node without its descendants
 */
export function testNode(node: Record<string, unknown>) {
    assert.strictEqual(typeof node, "object");
    assert.strictEqual(typeof node.type, "string");
    assert.ok((node.type as string).length >= 1);

    if (node.children !== null && node.children !== undefined) {
        assert.ok(Array.isArray(node.children));
    }

    if (node.value !== null && node.value !== undefined) {
        assert.strictEqual(typeof node.value, "string");
    }

    const position = node.position as Record<string, unknown> | null | undefined;
    if (position !== null && position !== undefined) {
        assert.strictEqual(typeof position, "object");

        const start = position.start as Record<string, unknown> | null | undefined;
        const indent = position.indent as number[] | null | undefined;
        const end = position.end as Record<string, unknown> | null | undefined;

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

        if (indent !== null && indent !== undefined) {
            assert.ok(Array.isArray(indent));

            indent.forEach(function (indentation: number) {
                assert.strictEqual(typeof indentation, "number");
                assert.ok(indentation >= 0);
            });
        }
    }
}
