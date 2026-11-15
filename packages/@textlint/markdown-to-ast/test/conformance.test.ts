import { describe, it } from "vitest";
import assert from "node:assert";
import type { TxtNode } from "@textlint/ast-node-types";
import { parse } from "../src/index.js";

type AnyNode = TxtNode & {
    children?: AnyNode[];
    value?: string;
    url?: string;
    title?: string | null;
    checked?: boolean | null;
};

/**
 * Compact form of a tree: `Type[start,end]` with the main property and the children
 */
const show = (node: AnyNode): string => {
    let out = `${node.type}[${node.range[0]},${node.range[1]}]`;
    if (node.checked !== undefined && node.checked !== null) {
        out += node.checked ? "[x]" : "[ ]";
    }
    if (node.url !== undefined) {
        out += `<${node.url}>`;
    }
    if (typeof node.title === "string") {
        out += JSON.stringify(node.title);
    }
    if (node.value !== undefined) {
        out += `=${JSON.stringify(node.value)}`;
    }
    if (node.children) {
        out += `(${node.children.map(show).join(" ")})`;
    }
    return out;
};
const blocks = (text: string) => (parse(text) as AnyNode).children!.map(show);
const inlines = (text: string) => (parse(text) as AnyNode).children![0].children!.map(show);

describe("CommonMark and GFM conformance", () => {
    describe("task list items", () => {
        // https://github.github.com/gfm/#task-list-items-extension-
        it("should put the marker in the list item, not in the paragraph", () => {
            assert.deepStrictEqual(blocks("- [ ] a\n- [x] b"), [
                'List[0,15](ListItem[0,7][ ](Paragraph[6,7](Str[6,7]="a")) ListItem[8,15][x](Paragraph[14,15](Str[14,15]="b")))'
            ]);
        });
        it("should start the paragraph at the same position regardless of its first child", () => {
            assert.deepStrictEqual(blocks("- [x] **a** b"), [
                'List[0,13](ListItem[0,13][x](Paragraph[6,13](Strong[6,11](Str[8,9]="a") Str[11,13]=" b")))'
            ]);
            assert.deepStrictEqual(blocks("- [ ] [a](b)"), [
                'List[0,12](ListItem[0,12][ ](Paragraph[6,12](Link[6,12]<b>(Str[7,8]="a"))))'
            ]);
        });
        it("should skip all whitespaces after the marker", () => {
            assert.deepStrictEqual(blocks("- [ ] \t  a"), [
                'List[0,10](ListItem[0,10][ ](Paragraph[9,10](Str[9,10]="a")))'
            ]);
        });
    });
    describe("list items", () => {
        // https://spec.commonmark.org/0.31.2/#list-items
        it("should start an empty list item after a block that is not a paragraph", () => {
            assert.deepStrictEqual(blocks("***\n-"), ["HorizontalRule[0,3]", "List[4,5](ListItem[4,5]())"]);
            assert.deepStrictEqual(blocks("# a\n2. b"), [
                'Header[0,3](Str[2,3]="a")',
                'List[4,8](ListItem[4,8](Paragraph[7,8](Str[7,8]="b")))'
            ]);
        });
        it("should not interrupt a paragraph by an empty list item or an ordered list that does not start with 1", () => {
            assert.deepStrictEqual(blocks("a\n-\n"), ['Header[0,3](Str[0,1]="a")']);
            assert.deepStrictEqual(blocks("a\n*\n"), ['Paragraph[0,3](Str[0,3]="a\\n*")']);
            assert.deepStrictEqual(blocks("a\n2. b"), ['Paragraph[0,6](Str[0,6]="a\\n2. b")']);
        });
    });
    describe("HTML blocks", () => {
        // https://spec.commonmark.org/0.31.2/#html-blocks
        it("should not interrupt a paragraph by a complete tag, even on a lazy continuation line", () => {
            assert.deepStrictEqual(blocks("> a\n<a>"), [
                'BlockQuote[0,7](Paragraph[2,7](Str[2,4]="a\\n" Html[4,7]="<a>"))'
            ]);
            assert.deepStrictEqual(blocks("a\n<a>"), ['Paragraph[0,5](Str[0,2]="a\\n" Html[2,5]="<a>")']);
        });
        it("should interrupt a paragraph by a block-level tag", () => {
            assert.deepStrictEqual(blocks("> a\n<div>"), [
                'BlockQuote[0,3](Paragraph[2,3](Str[2,3]="a"))',
                'Html[4,9]="<div>"'
            ]);
        });
    });
    describe("raw HTML", () => {
        // https://spec.commonmark.org/0.31.2/#raw-html
        it("should accept only spaces, tabs, and a line ending as whitespaces in a tag", () => {
            assert.deepStrictEqual(inlines("x <b id=x>y"), [
                'Str[0,2]="x "',
                'Html[2,10]="<b id=x>"',
                'Str[10,11]="y"'
            ]);
            assert.deepStrictEqual(inlines("x <b\nid=x>y"), [
                'Str[0,2]="x "',
                'Html[2,10]="<b\\nid=x>"',
                'Str[10,11]="y"'
            ]);
            assert.deepStrictEqual(inlines("x <b\u00a0id=x>y"), ['Str[0,11]="x <b\u00a0id=x>y"']);
            assert.deepStrictEqual(inlines("x <b\u2028id=x>y"), ['Str[0,11]="x <b\u2028id=x>y"']);
            assert.deepStrictEqual(inlines("x </b\u00a0>y"), ['Str[0,8]="x </b\u00a0>y"']);
        });
    });
    describe("autolinks", () => {
        // https://spec.commonmark.org/0.31.2/#autolinks
        it("should reject only ASCII control characters, space, `<`, and `>` in the URI", () => {
            assert.deepStrictEqual(inlines("<http://a\u00a0b>"), [
                'Link[0,12]<http://a\u00a0b>(Str[1,11]="http://a\u00a0b")'
            ]);
            assert.deepStrictEqual(inlines("<foo:a b>"), ['Str[0,9]="<foo:a b>"']);
        });
    });
    describe("emphasis and strikethrough", () => {
        // https://spec.commonmark.org/0.31.2/#emphasis-and-strong-emphasis
        // https://github.github.com/gfm/#strikethrough-extension-
        it("should give the pair that closes first to crossing delimiters", () => {
            assert.deepStrictEqual(inlines("*~~a* b~~"), ['Emphasis[0,5](Str[1,4]="~~a")', 'Str[5,9]=" b~~"']);
            assert.deepStrictEqual(inlines("~~a *b~~ c*"), ['Delete[0,8](Str[2,6]="a *b")', 'Str[8,11]=" c*"']);
            assert.deepStrictEqual(inlines("_~_~"), ['Emphasis[0,3](Str[1,2]="~")', 'Str[3,4]="~"']);
            assert.deepStrictEqual(inlines("~_~_"), ['Delete[0,3](Str[1,2]="_")', 'Str[3,4]="_"']);
        });
        it("should nest emphasis and strikethrough", () => {
            assert.deepStrictEqual(inlines("~~a *b* c~~"), [
                'Delete[0,11](Str[2,4]="a " Emphasis[4,7](Str[5,6]="b") Str[7,9]=" c")'
            ]);
            assert.deepStrictEqual(inlines("*a ~b~ c*"), [
                'Emphasis[0,9](Str[1,3]="a " Delete[3,6](Str[4,5]="b") Str[6,8]=" c")'
            ]);
        });
    });
    describe("link titles", () => {
        // https://spec.commonmark.org/0.31.2/#link-title
        it("should keep the whitespaces before a line ending in a title", () => {
            assert.deepStrictEqual(inlines('[x](u "first \nsecond")'), [
                'Link[0,22]<u>"first \\nsecond"(Str[1,2]="x")'
            ]);
            assert.deepStrictEqual(blocks('[x]: u "first \nsecond"'), ['Definition[0,22]<u>"first \\nsecond"']);
        });
    });
    describe("insecure characters", () => {
        // https://spec.commonmark.org/0.31.2/#insecure-characters
        it("should replace U+0000 with U+FFFD in values, and keep it in raw", () => {
            const text = "a\u0000b `c\u0000`\n\n```\n\u0000\n```\n\n<div>\u0000</div>";
            const AST = parse(text) as AnyNode;
            assert.deepStrictEqual(AST.children!.map(show), [
                'Paragraph[0,8](Str[0,4]="a\uFFFDb " Code[4,8]="c\uFFFD")',
                'CodeBlock[10,19]="\uFFFD"',
                'Html[21,33]="<div>\uFFFD</div>"'
            ]);
            assert.strictEqual(AST.raw, text);
            assert.strictEqual(AST.children![0].children![0].raw, "a\u0000b ");
        });
        it("should accept U+0000 in a link destination", () => {
            assert.deepStrictEqual(inlines("[x](u\u0000rl)"), ['Link[0,9]<u\uFFFDrl>(Str[1,2]="x")']);
        });
    });
    describe("lines of loc", () => {
        // U+2028 and U+2029 end a line for `loc`, and they do not end a line of the block structure
        it("should count U+2028 and U+2029 as line endings for loc only", () => {
            for (const separator of ["\u2028", "\u2029"]) {
                const AST = parse(`a${separator}# b *c*\n\nd`) as AnyNode;
                // `# b` is not a heading, because the separator does not start a new line of the block
                assert.deepStrictEqual(
                    AST.children!.map((node) => node.type),
                    ["Paragraph", "Paragraph"]
                );
                const emphasis = AST.children![0].children![1];
                assert.strictEqual(emphasis.type, "Emphasis");
                assert.deepStrictEqual(emphasis.range, [6, 9]);
                assert.deepStrictEqual(emphasis.loc, {
                    start: { line: 2, column: 4 },
                    end: { line: 2, column: 7 }
                });
                assert.deepStrictEqual(AST.children![1].loc, {
                    start: { line: 4, column: 0 },
                    end: { line: 4, column: 1 }
                });
            }
        });
        it("should count CR and CRLF as one line ending", () => {
            const AST = parse("a\r\rb\r\n\r\nc") as AnyNode;
            assert.deepStrictEqual(
                AST.children!.map((node) => node.loc.start.line),
                [1, 3, 5]
            );
        });
    });
});
