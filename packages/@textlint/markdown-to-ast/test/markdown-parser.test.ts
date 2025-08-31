// LICENSE : MIT
"use strict";
import { TxtNode } from "@textlint/ast-node-types";
import { beforeEach, describe, it } from "vitest";
import { parse, Syntax } from "../src/index";
import assert from "node:assert";
import traverse from "neotraverse/legacy";

const inspect = (obj: unknown) => JSON.stringify(obj, null, 4);

function findFirstTypedNode(node: TxtNode, type: string, value?: string): TxtNode {
    let result: TxtNode | null = null;
    traverse(node).forEach(function (x) {
        if (this.notLeaf) {
            if (x.type === type) {
                if (value == null) {
                    result = x;
                } else if (x.raw === value) {
                    result = x;
                }
            }
        }
    });
    if (result == null) {
        console.log(inspect(node));
        throw new Error(`Not Found type:${type}`);
    }
    return result;
}

function shouldHaveImplementTxtNode(node: TxtNode, rawValue: string) {
    const lines = rawValue.split("\n");
    const lastLine = lines[lines.length - 1];
    assert.strictEqual(node.raw, rawValue);
    assert.deepStrictEqual(node.loc, {
        start: {
            line: 1,
            column: 0
        },
        end: {
            line: lines.length,
            column: lastLine.length
        }
    });
    assert.deepStrictEqual(node.range, [0, rawValue.length]);
}

function shouldHaveImplementInlineTxtNode(node: TxtNode, text: string, allText: string) {
    assert.strictEqual(node.raw, text);
    const startColumn = allText.indexOf(text);
    assert.deepStrictEqual(node.loc, {
        start: {
            line: 1,
            column: startColumn
        },
        end: {
            line: 1,
            column: startColumn + text.length
        }
    });
    assert.deepStrictEqual(node.range, [startColumn, startColumn + text.length]);
}

/*
    NOTE:
        `line` start with 1
        `column` start with 0

 */
describe("markdown-parser", function () {
    describe("Node type is Document", function () {
        it("should has implemented TxtNode", function () {
            const RootDocument = parse("");
            assert.strictEqual(RootDocument.type, Syntax.Document);
            assert.strictEqual(RootDocument.raw, "");
            assert.deepStrictEqual(RootDocument.loc, { start: { line: 1, column: 0 }, end: { line: 1, column: 0 } });
            assert.deepStrictEqual(RootDocument.range, [0, 0]);
        });
        it("should has range and loc on whole text", function () {
            const text = "# Header\n\n" + "- list\n\n" + "text Str.";
            const lines = text.split("\n");
            const RootDocument = parse(text);
            assert.strictEqual(RootDocument.type, Syntax.Document);
            assert.strictEqual(RootDocument.raw, text);
            assert.deepStrictEqual(RootDocument.loc, {
                start: {
                    line: 1,
                    column: 0
                },
                end: {
                    line: lines.length,
                    column: lines[lines.length - 1].length
                }
            });
            assert.deepStrictEqual(RootDocument.range, [0, text.length]);
        });
        it("should has range and loc on whole text", function () {
            const text = "# Header\n" + "\n" + "text";
            const lines = text.split("\n");
            const RootDocument = parse(text);
            assert.strictEqual(RootDocument.type, Syntax.Document);
            assert.strictEqual(RootDocument.raw, text);
            assert.deepStrictEqual(RootDocument.loc, {
                start: {
                    line: 1,
                    column: 0
                },
                end: {
                    line: lines.length,
                    column: lines[lines.length - 1].length
                }
            });
            const slicedText = text.slice(RootDocument.range[0], RootDocument.range[1]);
            assert.deepStrictEqual(slicedText, text);
        });
    });
    /*
        Paragraph > Str
     */
    describe("Node type is Paragraph", function () {
        let AST: TxtNode, rawValue: string;
        beforeEach(function () {
            rawValue = "string";
            AST = parse(rawValue);
        });
        describe("Paragraph", function () {
            it("should has implemented TxtNode", function () {
                const node = findFirstTypedNode(AST, Syntax.Paragraph, rawValue);
                shouldHaveImplementTxtNode(node, rawValue);
            });
        });
        describe("Text", function () {
            it("should has implemented TxtNode", function () {
                const node = findFirstTypedNode(AST, Syntax.Str, rawValue);
                shouldHaveImplementTxtNode(node, rawValue);
            });
        });
    });
    /*
        H1  > Str
     */
    describe("Node type is Header", function () {
        /**
         * text
         * =====
         **/
        describe("SetextHeader", function () {
            let AST: TxtNode, text: string, header: string;
            beforeEach(function () {
                text = "string";
                header = `${text}\n======`;
                AST = parse(header);
            });
            describe("Header", function () {
                it("should has implemented TxtNode", function () {
                    const node = findFirstTypedNode(AST, Syntax.Header);
                    shouldHaveImplementTxtNode(node, header);
                });
            });
            describe("Str", function () {
                it("should has implemented TxtNode", function () {
                    const node = findFirstTypedNode(AST, Syntax.Str);
                    shouldHaveImplementTxtNode(node, text);
                });
            });
        });
        /**
         * # text
         * */
        describe("ATXHeader", function () {
            let AST: TxtNode, text: string, header: string;
            beforeEach(function () {
                text = "string";
                header = `# ${text}`;
                AST = parse(header);
            });
            describe("Header", function () {
                it("should has implemented TxtNode", function () {
                    const node = findFirstTypedNode(AST, Syntax.Header);
                    shouldHaveImplementTxtNode(node, header);
                });
            });
            describe("Str", function () {
                it("should have correct range", function () {
                    const node = findFirstTypedNode(AST, Syntax.Str);
                    shouldHaveImplementInlineTxtNode(node, text, header);
                });
            });
        });
    });
    describe("Node type is Link", function () {
        let AST: TxtNode, rawValue: string, labelText: string;
        beforeEach(function () {
            labelText = "text";
            rawValue = `[${labelText}](http://example.com)`;
            AST = parse(rawValue);
        });
        it("should has implemented TxtNode", function () {
            const node = findFirstTypedNode(AST, Syntax.Link);
            shouldHaveImplementTxtNode(node, rawValue);
        });
        describe("Str", function () {
            it("should have correct range", function () {
                const node = findFirstTypedNode(AST, Syntax.Str);
                shouldHaveImplementInlineTxtNode(node, labelText, rawValue);
            });
        });
    });
    describe("Node type is List", function () {
        it("should has implemented TxtNode", function () {
            const rawValue = "- list1\n- list2",
                AST = parse(rawValue);
            const node = findFirstTypedNode(AST, Syntax.List);
            shouldHaveImplementTxtNode(node, rawValue);
        });
    });
    describe("Node type is ListItem", function () {
        it("should same the bullet_char", function () {
            let node: TxtNode, AST: TxtNode;
            AST = parse("- item");
            node = findFirstTypedNode(AST, Syntax.ListItem);
            assert(/^-/.test(node.raw));
            AST = parse("* item");
            node = findFirstTypedNode(AST, Syntax.ListItem);
            assert(/^\*/.test(node.raw));
        });
        it("should have marker_offser of each items", function () {
            const AST = parse("- item\n" + "   - item2"); // second line should has offset
            const node = findFirstTypedNode(AST, Syntax.ListItem, "- item2");
            assert(node);
            assert.strictEqual(node.raw, "- item2");
        });
        it("should has implemented TxtNode", function () {
            const text = "text",
                rawValue = `- ${text}`,
                AST = parse(rawValue);
            const node = findFirstTypedNode(AST, Syntax.ListItem);
            shouldHaveImplementTxtNode(node, rawValue);
        });
        describe("Str", function () {
            it("should have correct range", function () {
                const text = "text",
                    rawValue = `- ${text}`,
                    AST = parse(rawValue);
                const node = findFirstTypedNode(AST, Syntax.Str);
                shouldHaveImplementInlineTxtNode(node, text, rawValue);
            });
        });
    });
    /*
        > BlockQuote
    */
    describe("Node type is BlockQuote", function () {
        let AST: TxtNode, rawValue: string, text: string;
        beforeEach(function () {
            text = "text";
            rawValue = `> ${text}`;
            AST = parse(rawValue);
        });
        it("should has implemented TxtNode", function () {
            const node = findFirstTypedNode(AST, Syntax.BlockQuote);
            assert.deepStrictEqual(node.range, [0, rawValue.length]);
        });
    });
    /*
    ```
    CodeBlock
    ```
    */
    describe("Node type is CodeBlock", function () {
        describe("IndentCodeBlock", function () {
            let AST: TxtNode, rawValue: string, code: string;
            beforeEach(function () {
                code = "var code;";
                rawValue = `${"    \n" + "    "}${code}\n\n`;
                AST = parse(rawValue);
            });
            it("should has implemented TxtNode", function () {
                const node = findFirstTypedNode(AST, Syntax.CodeBlock);
                assert(node.raw.indexOf(code) !== -1);
                const slicedCode = rawValue.slice(node.range[0], node.range[1]);
                assert.strictEqual(slicedCode.trim(), code);
            });
        });
        describe("FencedCode", function () {
            let AST: TxtNode, rawValue: string, code: string;
            beforeEach(function () {
                code = "var code;";
                rawValue = `\`\`\`\n${code}\n\`\`\``;
                AST = parse(rawValue);
            });
            it("should has implemented TxtNode", function () {
                const node = findFirstTypedNode(AST, Syntax.CodeBlock);
                const codeBlockRaw = rawValue;
                assert.strictEqual(node.raw, codeBlockRaw);
                const slicedCode = rawValue.slice(node.range[0], node.range[1]);
                assert.strictEqual(slicedCode, codeBlockRaw);
            });
        });
    });
    /*
        `code`
     */
    describe("Node type is Code", function () {
        let AST: TxtNode, rawValue: string;
        beforeEach(function () {
            rawValue = "`code`";
            AST = parse(rawValue);
        });
        it("should has implemented TxtNode", function () {
            const node = findFirstTypedNode(AST, Syntax.Code);
            shouldHaveImplementTxtNode(node, rawValue);
        });
    });
    /*
        __Strong__
     */
    describe("Node type is Strong", function () {
        let AST: TxtNode, rawValue: string, text: string;
        beforeEach(function () {
            text = "text";
            rawValue = `__${text}__`;
            AST = parse(rawValue);
        });
        it("should has implemented TxtNode", function () {
            const node = findFirstTypedNode(AST, Syntax.Strong);
            shouldHaveImplementTxtNode(node, rawValue);
        });
        describe("Str", function () {
            it("should have correct range", function () {
                const node = findFirstTypedNode(AST, Syntax.Str);
                shouldHaveImplementInlineTxtNode(node, text, rawValue);
            });
        });
    });

    /*
        ![text](http://example.com/a.png)
     */
    describe("Node type is Image", function () {
        let AST: TxtNode, rawValue: string, labelText: string;
        beforeEach(function () {
            labelText = "text";
            rawValue = `![${labelText}](http://example.com/a.png)`;
            AST = parse(rawValue);
        });
        it("should has implemented TxtNode", function () {
            const node = findFirstTypedNode(AST, Syntax.Image);
            shouldHaveImplementTxtNode(node, rawValue);
        });
    });
    /*
     *text*
     */
    describe("Node type is Emphasis", function () {
        let AST: TxtNode, rawValue: string, text: string;
        beforeEach(function () {
            text = "text";
            rawValue = `*${text}*`;
            AST = parse(rawValue);
        });
        it("should has implemented TxtNode", function () {
            const node = findFirstTypedNode(AST, Syntax.Emphasis);
            shouldHaveImplementTxtNode(node, rawValue);
        });
        describe("Str", function () {
            it("should have correct range", function () {
                const node = findFirstTypedNode(AST, Syntax.Str);
                shouldHaveImplementInlineTxtNode(node, text, rawValue);
            });
        });
    });
    /*
    ----
    */
    describe("Node type is HorizontalRule", function () {
        let AST: TxtNode, rawValue: string;
        beforeEach(function () {
            rawValue = "----";
            AST = parse(rawValue);
        });
        it("should has implemented TxtNode", function () {
            const node = findFirstTypedNode(AST, Syntax.HorizontalRule);
            shouldHaveImplementTxtNode(node, rawValue);
        });
    });
    /*
        <html>
     */
    describe("Node type is Html", function () {
        let AST: TxtNode, rawValue: string;
        beforeEach(function () {
            rawValue = "<p>text</p>";
            AST = parse(rawValue);
        });
        it("should has implemented TxtNode", function () {
            const node = findFirstTypedNode(AST, Syntax.Html);
            shouldHaveImplementTxtNode(node, rawValue);
        });
    });
});
