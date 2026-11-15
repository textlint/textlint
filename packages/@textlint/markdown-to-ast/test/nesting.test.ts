import { describe, it } from "vitest";
import assert from "node:assert";
import type { TxtNode, TxtParentNode } from "@textlint/ast-node-types";
import { parse } from "../src/index.js";

// The parser limits the nesting depth of block containers and inline nodes to 100
const MAX_NESTING = 100;

/**
 * Walk the AST without recursion, because the tests handle a deep AST
 */
const walk = (root: TxtNode, visitor: (node: TxtNode, depth: number) => void) => {
    const stack: [TxtNode, number][] = [[root, 0]];
    while (stack.length > 0) {
        const [node, depth] = stack.pop() as [TxtNode, number];
        visitor(node, depth);
        const children = (node as TxtParentNode).children;
        if (children) {
            for (let i = children.length - 1; i >= 0; i--) {
                stack.push([children[i], depth + 1]);
            }
        }
    }
};
const countOf = (root: TxtNode, type: string) => {
    let count = 0;
    walk(root, (node) => {
        if (node.type === type) {
            count++;
        }
    });
    return count;
};
const maxDepthOf = (root: TxtNode) => {
    let max = 0;
    walk(root, (_node, depth) => {
        if (depth > max) {
            max = depth;
        }
    });
    return max;
};
const lastLeafOf = (root: TxtNode) => {
    let node = root;
    for (;;) {
        const children = (node as TxtParentNode).children;
        if (!children || children.length === 0) {
            return node;
        }
        node = children[children.length - 1];
    }
};
const assertPositions = (root: TxtNode, text: string) => {
    walk(root, (node) => {
        assert.strictEqual(node.raw, text.slice(node.range[0], node.range[1]), `${node.type}: raw`);
    });
};

describe("nesting", () => {
    describe("at the limit", () => {
        it("should parse block quotes up to the limit", () => {
            const AST = parse(`${"> ".repeat(MAX_NESTING)}a`);
            assert.strictEqual(countOf(AST, "BlockQuote"), MAX_NESTING);
            assert.strictEqual((lastLeafOf(AST) as TxtNode & { value: string }).value, "a");
        });
        it("should treat block quote markers beyond the limit as text", () => {
            const text = `${"> ".repeat(MAX_NESTING + 2)}a`;
            const AST = parse(text);
            assert.strictEqual(countOf(AST, "BlockQuote"), MAX_NESTING);
            assert.strictEqual((lastLeafOf(AST) as TxtNode & { value: string }).value, "> > a");
            assertPositions(AST, text);
        });
        it("should treat list markers beyond the limit as text", () => {
            // a list item is nested in List and ListItem
            const text = `${"- ".repeat(MAX_NESTING / 2 + 1)}a`;
            const AST = parse(text);
            assert.strictEqual(countOf(AST, "List"), MAX_NESTING / 2);
            assert.strictEqual(countOf(AST, "ListItem"), MAX_NESTING / 2);
            assert.strictEqual((lastLeafOf(AST) as TxtNode & { value: string }).value, "- a");
            assertPositions(AST, text);
        });
        it("should parse emphasis up to the limit", () => {
            const AST = parse(`${"*a ".repeat(MAX_NESTING)}b${"*".repeat(MAX_NESTING)}`);
            assert.strictEqual(countOf(AST, "Emphasis"), MAX_NESTING);
        });
        it("should treat emphasis markers beyond the limit as text", () => {
            const text = `${"*a ".repeat(MAX_NESTING + 1)}b${"*".repeat(MAX_NESTING + 1)}`;
            const AST = parse(text);
            assert.strictEqual(countOf(AST, "Emphasis"), MAX_NESTING);
            const paragraph = AST.children[0] as TxtParentNode;
            assert.strictEqual((paragraph.children[0] as TxtNode & { value: string }).value, "*a ");
            assert.strictEqual((lastLeafOf(AST) as TxtNode & { value: string }).value, "*");
            assertPositions(AST, text);
        });
        it("should limit strong, strikethrough, and inline notes too", () => {
            const strong = parse(`${"*".repeat(MAX_NESTING * 2 + 1)}a${"*".repeat(MAX_NESTING * 2 + 1)}`);
            assert.strictEqual(countOf(strong, "Strong"), MAX_NESTING);
            assert.strictEqual(countOf(strong, "Emphasis"), 0);
            const strike = parse(`${"~~a ".repeat(MAX_NESTING + 1)}b${"~~ c".repeat(MAX_NESTING + 1)}`);
            assert.strictEqual(countOf(strike, "Delete"), MAX_NESTING);
            const note = parse(`${"^[".repeat(MAX_NESTING + 1)}a${"]".repeat(MAX_NESTING + 1)}`);
            assert.strictEqual(countOf(note, "footnote"), MAX_NESTING);
        });
    });
    describe("very deep nesting", () => {
        const N = 100_000;
        const inputs: [string, string][] = [
            ["block quotes", `${"> ".repeat(N)}a`],
            ["block quotes without space", `${">".repeat(N)}a`],
            ["list items", `${"- ".repeat(N)}a`],
            ["ordered list items", `${"1. ".repeat(N)}a`],
            ["mixed containers", `${"> - ".repeat(N)}a`],
            ["footnote definitions", `${"[^1]: ".repeat(N)}a`],
            ["emphasis", `${"*a ".repeat(N)}b${"*".repeat(N)}`],
            ["emphasis and strong", `${"*a **b ".repeat(N / 2)}c${"** d*".repeat(N / 2)}`],
            ["a long run of *", `${"*".repeat(N)}a${"*".repeat(N)}`],
            ["strikethrough", `${"~~a ".repeat(N)}b${"~~ c".repeat(N)}`],
            ["brackets", `${"[".repeat(N)}a${"]".repeat(N)}`],
            ["links", `${"[".repeat(N)}a${"](u)".repeat(N)}`],
            ["images", `${"![".repeat(N)}a${"](u)".repeat(N)}`],
            ["inline notes", `${"^[".repeat(N)}a${"]".repeat(N)}`],
            ["emphasis in a table cell", `|a|\n|-|\n|${"*a ".repeat(N)}b${"*".repeat(N)}|`],
            [
                "indented nested lists",
                Array.from({ length: 1000 }, (_, index) => `${" ".repeat(index * 2)}- a`).join("\n")
            ]
        ];
        for (const [name, text] of inputs) {
            it(`should not throw for ${name}`, () => {
                const AST = parse(text);
                assert.strictEqual(AST.type, "Document");
                assert.deepStrictEqual(AST.range, [0, text.length]);
                // Document > containers(<= 100) > Paragraph or TableCell > inline nodes(<= 100) > Str
                assert.ok(maxDepthOf(AST) <= MAX_NESTING * 2 + 5, `depth: ${maxDepthOf(AST)}`);
                assertPositions(AST, text);
            });
        }
    });
});
