import { describe, it } from "vitest";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { TxtNode, TxtParentNode } from "@textlint/ast-node-types";
import { parse } from "../src/index.js";

const fixtureDir = fileURLToPath(new URL("fixtures", import.meta.url));

/**
 * Check the invariants that every TxtNode should satisfy
 */
const assertInvariants = (text: string) => {
    const lineStarts = [0];
    for (let i = 0; i < text.length; i++) {
        const ch = text.charCodeAt(i);
        if (ch === 10 || (ch === 13 && text.charCodeAt(i + 1) !== 10)) {
            lineStarts.push(i + 1);
        }
    }
    const toIndex = (position: { line: number; column: number }) => lineStarts[position.line - 1] + position.column;
    const visit = (node: TxtNode, parent?: TxtNode) => {
        const [start, end] = node.range;
        assert.ok(0 <= start && start <= end && end <= text.length, `${node.type}: range is out of text`);
        assert.strictEqual(node.raw, text.slice(start, end), `${node.type}: raw should be the slice of range`);
        assert.strictEqual(toIndex(node.loc.start), start, `${node.type}: loc.start should match range[0]`);
        assert.strictEqual(toIndex(node.loc.end), end, `${node.type}: loc.end should match range[1]`);
        if (parent) {
            assert.ok(
                parent.range[0] <= start && end <= parent.range[1],
                `${node.type}: range should be inside of the parent ${parent.type}`
            );
        }
        const children = (node as TxtParentNode).children;
        if (children) {
            let prevEnd = start;
            for (const child of children) {
                assert.ok(prevEnd <= child.range[0], `${child.type}: should not overlap with the previous sibling`);
                prevEnd = child.range[1];
                visit(child, node);
            }
        }
    };
    const AST = parse(text);
    assert.deepStrictEqual(AST.range, [0, text.length]);
    visit(AST);
};

describe("invariants", () => {
    it("should satisfy the invariants for all fixtures", () => {
        for (const name of fs.readdirSync(fixtureDir)) {
            const inputFilePath = path.join(fixtureDir, name, "input.md");
            if (!fs.existsSync(inputFilePath)) {
                continue;
            }
            const text = fs.readFileSync(inputFilePath, "utf-8").replace(/^﻿/, "");
            try {
                assertInvariants(text);
            } catch (error) {
                throw new Error(`${name}: ${(error as Error).message}`, { cause: error });
            }
        }
    });
    it("should satisfy the invariants for random inputs", () => {
        const pieces = [
            "a",
            "b c",
            " ",
            "  ",
            "    ",
            "\t",
            "\n",
            "\n\n",
            "\r\n",
            "*",
            "**",
            "_",
            "~~",
            "`",
            "```",
            "~~~",
            "#",
            "## ",
            "> ",
            "- ",
            "+ ",
            "1. ",
            "2) ",
            "[",
            "]",
            "(",
            ")",
            "![",
            "[^1]",
            "[^1]: ",
            "[a]: /url",
            "<",
            ">",
            "<div>",
            "</div>",
            "<!--",
            "-->",
            "|",
            "| - |",
            ":-:",
            "---",
            "===",
            "\\",
            "&amp;",
            "&#x26;",
            "http://a.b",
            "www.a.b",
            "a@b.c",
            "[ ]",
            "[x]",
            '"',
            "'",
            "!",
            ":",
            "あ",
            "🍣"
        ];
        // xorshift32: deterministic random
        let seed = 20261114;
        const random = () => {
            seed ^= seed << 13;
            seed ^= seed >>> 17;
            seed ^= seed << 5;
            return (seed >>> 0) / 4294967296;
        };
        for (let i = 0; i < 3000; i++) {
            let text = "";
            const length = 1 + Math.floor(random() * 30);
            for (let j = 0; j < length; j++) {
                text += pieces[Math.floor(random() * pieces.length)];
            }
            try {
                assertInvariants(text);
            } catch (error) {
                throw new Error(`${JSON.stringify(text)}: ${(error as Error).message}`, { cause: error });
            }
        }
    });
});
