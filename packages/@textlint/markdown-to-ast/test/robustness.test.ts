import { describe, it } from "vitest";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { TxtNode, TxtParentNode } from "@textlint/ast-node-types";
import { parse } from "../src/index.js";

const fixtureDir = fileURLToPath(new URL("fixtures", import.meta.url));
const fixtureTexts = fs
    .readdirSync(fixtureDir)
    .map((name) => path.join(fixtureDir, name, "input.md"))
    .filter((filePath) => fs.existsSync(filePath))
    .map((filePath) => fs.readFileSync(filePath, "utf-8"));

const inlineOf = (text: string) => {
    const paragraph = parse(text).children[0] as TxtParentNode;
    return paragraph.children.map((node: TxtNode & { value?: string; url?: string; title?: string | null }) => {
        if (node.type === "Link") {
            return `Link(${node.url}, ${node.title})`;
        }
        return `${node.type}(${node.value ?? node.raw})`;
    });
};

describe("robustness", () => {
    describe("independent parse calls", () => {
        it("should return the same AST regardless of the documents parsed before", () => {
            // The parser reuses its buffers between calls. A call must not be affected by the previous calls
            const expected = fixtureTexts.map((text) => JSON.stringify(parse(text)));
            for (let i = fixtureTexts.length - 1; i >= 0; i--) {
                assert.strictEqual(JSON.stringify(parse(fixtureTexts[i])), expected[i]);
            }
            // a large document grows the buffers. The following calls must not be affected
            parse(fixtureTexts.join("\n\n").repeat(3));
            for (let i = 0; i < fixtureTexts.length; i++) {
                assert.strictEqual(JSON.stringify(parse(fixtureTexts[i])), expected[i]);
            }
        });
        it("should return a new AST for each call", () => {
            const text = "# Title\n\ntext *em* `code`\n";
            const first = parse(text);
            const snapshot = JSON.stringify(first);
            parse("- another\n- document\n");
            assert.strictEqual(JSON.stringify(first), snapshot);
            assert.notStrictEqual(parse(text), first);
        });
    });
    describe("scans that are shared between candidates", () => {
        it("should parse titles in parentheses", () => {
            assert.deepStrictEqual(inlineOf("[a](b (t)) [c](d (u))"), ["Link(b, t)", "Str( )", "Link(d, u)"]);
            // `(` does not close the title: the first title ends at the first `)`
            assert.deepStrictEqual(inlineOf("[a](b (x [c](d (y))"), ["Link(b, x [c](d (y)"]);
            assert.deepStrictEqual(inlineOf("[a](b (x [c](d (y) z"), ["Str([a](b (x [c](d (y) z)"]);
            assert.deepStrictEqual(inlineOf("[a](b (x [c](d (\\)y))"), ["Link(b, x [c](d ()y)"]);
        });
        it("should parse raw HTML that needs a terminator", () => {
            assert.deepStrictEqual(inlineOf("a <!-- b <!-- c --> d <!-- e"), [
                "Str(a )",
                "Html(<!-- b <!-- c -->)",
                "Str( d <!-- e)"
            ]);
            // `<!-->` and `<!--->` are comments by themselves
            assert.deepStrictEqual(inlineOf("a <!--> b <!---> c <!-- d"), [
                "Str(a )",
                "Html(<!-->)",
                "Str( b )",
                "Html(<!--->)",
                "Str( c <!-- d)"
            ]);
            assert.deepStrictEqual(inlineOf("a <?b <?c?> <?d"), ["Str(a )", "Html(<?b <?c?>)", "Str( <?d)"]);
            assert.deepStrictEqual(inlineOf("a <![CDATA[b <![CDATA[c]]> <![CDATA[d"), [
                "Str(a )",
                "Html(<![CDATA[b <![CDATA[c]]>)",
                "Str( <![CDATA[d)"
            ]);
        });
        it("should parse code spans by the size of backtick runs", () => {
            assert.deepStrictEqual(inlineOf("`a `` b` ``c`` `d"), ["Code(a `` b)", "Str( )", "Code(c)", "Str( `d)"]);
            assert.deepStrictEqual(inlineOf("``a` ```b`` `c"), ["Code(a` ```b)", "Str( `c)"]);
            assert.deepStrictEqual(inlineOf("``a` ```b` `c"), ["Str(``a)", "Code( ```b)", "Str( `c)"]);
        });
    });
    describe("inputs that repeat a candidate without its terminator", () => {
        // These inputs took time proportional to the square of the length if each candidate scans the rest of the block.
        // The tests fail by timeout in that case.
        const size = 200_000;
        const cases: [string, string][] = [
            ["titles in parentheses", "[a](b (".repeat(size / 7)],
            ["titles in parentheses with one `)`", `${"[a](b (".repeat(size / 7)})`],
            ["comments", "a <!-- b\n".repeat(size / 9)],
            ["processing instructions", "a <? b\n".repeat(size / 7)],
            ["declarations", "a <!A b\n".repeat(size / 8)],
            ["CDATA", "a <![CDATA[ b\n".repeat(size / 14)],
            ["dots in the domain of a URL", `https://a${".".repeat(size)}b`],
            ["dots in the path of a URL", `https://a/${".".repeat(size)}b`],
            ["underscores in the domain of a URL", `www.a${"_".repeat(size)}b`],
            ["character references in the path of a URL", `https://a/${"&a;".repeat(size / 3)}b`],
            ["brackets in the path of a URL", `https://a/${"]".repeat(size)}b`],
            [
                "backtick runs of different sizes",
                (() => {
                    let text = "";
                    for (let run = 31; text.length < size; run++) {
                        text += `${"`".repeat(run)}a `;
                    }
                    return text;
                })()
            ]
        ];
        for (const [name, text] of cases) {
            it(`should parse ${name}`, () => {
                const AST = parse(text);
                assert.deepStrictEqual(AST.range, [0, text.length]);
                assert.strictEqual(AST.raw, text);
            });
        }
    });
});
