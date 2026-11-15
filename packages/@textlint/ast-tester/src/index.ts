// LICENSE : MIT
"use strict";
import * as assert from "node:assert";
import { TxtNode } from "@textlint/ast-node-types";
import { testNode as testUnistNode } from "./unist-test.js";
import debug0 from "debug";

const debug = debug0("textlint/ast-tester");

type UnknownRecord = Record<string, unknown>;

const createMessage = ({ node, message }: { node: unknown; message: string }) => {
    return `${message}\n${JSON.stringify(node, null, 4)}`;
};

/**
 * Assert the condition.
 * The message is created only when the condition is false, because the message includes the serialized node.
 */
const check = (condition: boolean, node: unknown, message: string): void => {
    if (!condition) {
        assert.fail(createMessage({ node, message }));
    }
};

const isNil = (value: unknown): value is null | undefined => {
    return value === null || value === undefined;
};

export function isTxtAST(node: unknown): node is TxtNode {
    try {
        test(node as UnknownRecord);
    } catch (error) {
        debug("This is not TxtAST", error);
        return false;
    }
    return true;
}

/**
 * Test that the node and its descendants are TxtAST.
 * It checks the properties of each node, and the conventions between `raw`, `range`, and `loc`.
 * It throws an AssertionError if the node is not TxtAST.
 */
export function test(node: UnknownRecord) {
    check(typeof node === "object" && node !== null, node, `invalid node: node should be object`);
    // The whole tree is serialized once
    try {
        JSON.parse(JSON.stringify(node));
    } catch {
        assert.fail(`invalid node: node should be serializable. type: ${String(node.type)}`);
    }
    // Walk with a stack, because the depth of the tree depends on the document
    const stack: UnknownRecord[] = [node];
    while (stack.length > 0) {
        const current = stack.pop() as UnknownRecord;
        testNode(current);
        const children = current.children as UnknownRecord[] | null | undefined;
        if (!isNil(children)) {
            for (let i = children.length - 1; i >= 0; i--) {
                stack.push(children[i]);
            }
        }
    }
    testPositions(node as unknown as PositionedNode);
}

/**
 * Test `line`, `column`, and `offset` of a position
 */
function testPosition(position: UnknownRecord) {
    assert.strictEqual(typeof position, "object");
    if (!isNil(position.line)) {
        assert.strictEqual(typeof position.line, "number");
        assert.ok((position.line as number) >= 0); // allow `0` for `null`.
    }
    if (!isNil(position.column)) {
        assert.strictEqual(typeof position.column, "number");
        assert.ok((position.column as number) >= 0); // allow `0` for `null`.
    }
    if (!isNil(position.offset)) {
        assert.strictEqual(typeof position.offset, "number");
        assert.ok((position.offset as number) >= 0);
    }
}

/**
 * Test the properties of a node without its descendants
 */
function testNode(node: UnknownRecord) {
    check(typeof node === "object" && node !== null, node, `invalid node: node should be object`);
    // test unist that is weak.
    testUnistNode(node);
    check(typeof node.type === "string", node, `invalid type: type should be string`);
    check((node.type as string).length >= 1, node, `invalid type: type is empty string`);
    // children
    if (!isNil(node.children)) {
        check(Array.isArray(node.children), node, `invalid children: children should be an array`);
    }
    // value
    if (!isNil(node.value)) {
        check(typeof node.value === "string", node, `invalid value: value should be string`);
    }
    // raw
    check(!isNil(node.raw), node, `invalid raw: raw is undefined`);
    check(typeof node.raw === "string", node, `invalid raw: raw is not string`);
    // loc
    const loc = node.loc as UnknownRecord;
    check(!isNil(loc), node, `invalid loc: node.loc is undefined`);
    check(
        typeof loc === "object",
        node,
        `invalid loc: node.loc should be object. it should have { start, end } property`
    );
    const start = loc.start as UnknownRecord | null | undefined;
    const end = loc.end as UnknownRecord | null | undefined;
    if (!isNil(start)) {
        testPosition(start);
    }
    if (!isNil(end)) {
        testPosition(end);
    }
    // range
    const range = node.range as number[];
    check(!isNil(range), node, `invalid range: range should be an array`);
    check(Array.isArray(range), node, `invalid range: range should be an array`);
    for (const index of range) {
        check(typeof index === "number", node, `invalid index: index should be number`);
        check(index >= 0, node, `invalid index: index >= 0`);
    }
    check(range[0] <= range[1], node, `invalid range: range[0] should be less than range[1]`);
}

type Position = { line: number; column: number };
type PositionedNode = {
    type: string;
    raw: string;
    range: [number, number];
    loc: { start?: Position | null; end?: Position | null };
    children?: PositionedNode[] | null;
};

/**
 * Start offsets of lines in the text.
 * A line ends with LF, CR, or CRLF in every format. CRLF is one line ending.
 * It is the same as the line endings of CommonMark and of the Language Server Protocol.
 */
const lineStartsOf = (text: string): number[] => {
    const starts = [0];
    for (let i = 0; i < text.length; i++) {
        const c = text.charCodeAt(i);
        if (c === 10 || c === 13) {
            if (c === 13 && text.charCodeAt(i + 1) === 10) {
                i++;
            }
            starts.push(i + 1);
        }
    }
    return starts;
};

const positionOf = (starts: number[], offset: number, origin: Position): Position => {
    // the last line that starts at or before the offset
    let lo = 0;
    let hi = starts.length - 1;
    while (lo < hi) {
        const mid = (lo + hi + 1) >> 1;
        if (starts[mid] <= offset) {
            lo = mid;
        } else {
            hi = mid - 1;
        }
    }
    return {
        line: origin.line + lo,
        column: lo === 0 ? origin.column + offset : offset - starts[lo]
    };
};

const isPosition = (position: Position | null | undefined): position is Position => {
    return !isNil(position) && typeof position.line === "number" && typeof position.column === "number";
};

/**
 * Test the conventions between `raw`, `range`, and `loc` in the tree.
 *
 * - `raw` is the text of `range`
 * - `loc` is the same span as `range`
 * - a child is inside of its parent, and siblings are in the source order without overlapping
 *
 * The text is `raw` of the root, so the root can be any node.
 */
function testPositions(root: PositionedNode) {
    const text = root.raw;
    const base = root.range[0];
    check(
        text.length === root.range[1] - root.range[0],
        root,
        `invalid raw: the length of raw should be the length of range`
    );
    const origin = root.loc.start;
    const starts = lineStartsOf(text);
    const testLocOf = (node: PositionedNode, name: "start" | "end") => {
        const actual = node.loc[name];
        if (!isPosition(origin) || !isPosition(actual)) {
            return;
        }
        const offset = node.range[name === "start" ? 0 : 1] - base;
        const expected = positionOf(starts, offset, origin);
        check(
            actual.line === expected.line && actual.column === expected.column,
            node,
            `invalid loc: loc.${name} should be the position of range[${
                name === "start" ? 0 : 1
            }]. Expected ${JSON.stringify(expected)}`
        );
    };
    testLocOf(root, "start");
    testLocOf(root, "end");
    const stack: PositionedNode[] = [root];
    while (stack.length > 0) {
        const parent = stack.pop() as PositionedNode;
        const children = parent.children;
        if (isNil(children)) {
            continue;
        }
        let previousEnd = parent.range[0];
        for (const child of children) {
            check(
                child.range[0] >= parent.range[0] && child.range[1] <= parent.range[1],
                child,
                `invalid range: range should be inside of the range of the parent [${parent.range[0]}, ${parent.range[1]}]`
            );
            check(
                child.range[0] >= previousEnd,
                child,
                `invalid range: range should not overlap with the previous sibling that ends at ${previousEnd}`
            );
            previousEnd = child.range[1];
            check(
                child.raw === text.slice(child.range[0] - base, child.range[1] - base),
                child,
                `invalid raw: raw should be the text of range`
            );
            testLocOf(child, "start");
            testLocOf(child, "end");
        }
        for (let i = children.length - 1; i >= 0; i--) {
            stack.push(children[i]);
        }
    }
}
