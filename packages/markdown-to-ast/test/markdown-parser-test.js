// LICENSE : MIT
"use strict";
var assert = require("power-assert");
var parse = require("../src/markdown/markdown-parser").parse;
var Syntax = require("../src/markdown/markdown-parser").Syntax;
var inspect = (obj) => JSON.stringify(obj, null, 4);
var traverse = require("traverse");
function findFirstTypedNode(node, type, value) {
    var result = null;
    traverse(node).forEach(function(x) {
        // eslint-disable-next-line no-invalid-this
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
        /* eslint-disable no-console */
        console.log("Not Found type:" + type);
        console.log(inspect(node));
        /* eslint-enable no-console */
    }
    return result;
}

function shouldHaveImplementTxtNode(node, rawValue) {
    var lines = rawValue.split("\n");
    var lastLine = lines[lines.length - 1];
    assert.equal(node.raw, rawValue);
    assert.deepEqual(node.loc, {
        start: {
            line: 1,
            column: 0
        },
        end: {
            line: lines.length,
            column: lastLine.length
        }
    });
    assert.deepEqual(node.range, [0, rawValue.length]);
}
function shouldHaveImplementInlineTxtNode(node, text, allText) {
    assert.equal(node.raw, text);
    var startColumn = allText.indexOf(text);
    assert.deepEqual(node.loc, {
        start: {
            line: 1,
            column: startColumn
        },
        end: {
            line: 1,
            column: startColumn + text.length
        }
    });
    assert.deepEqual(node.range, [startColumn, startColumn + text.length]);
}
/*
    NOTE:
        `line` start with 1
        `column` start with 0

 */
describe("markdown-parser", function() {
    context("Node type is Document", function() {
        it("should has implemented TxtNode", function() {
            var RootDocument = parse("");
            assert.equal(RootDocument.type, Syntax.Document);
            assert.equal(RootDocument.raw, "");
            assert.deepEqual(RootDocument.loc, {
                start: {
                    line: 1,
                    column: 0
                },
                end: {
                    line: 1,
                    column: 0
                }
            });
            assert.deepEqual(RootDocument.range, [0, 0]);
        });
        it("should has range and loc on whole text", function() {
            var text = "# Header\n\n" + "- list\n\n" + "text Str.";
            var lines = text.split("\n");
            var RootDocument = parse(text);
            assert.equal(RootDocument.type, Syntax.Document);
            assert.equal(RootDocument.raw, text);
            assert.deepEqual(RootDocument.loc, {
                start: {
                    line: 1,
                    column: 0
                },
                end: {
                    line: lines.length,
                    column: lines[lines.length - 1].length
                }
            });
            assert.deepEqual(RootDocument.range, [0, text.length]);
        });
        it("should has range and loc on whole text", function() {
            var text = "# Header\n" +
                "\n" +
                "text";
            var lines = text.split("\n");
            var RootDocument = parse(text);
            assert.equal(RootDocument.type, Syntax.Document);
            assert.equal(RootDocument.raw, text);
            assert.deepEqual(RootDocument.loc, {
                start: {
                    line: 1,
                    column: 0
                },
                end: {
                    line: lines.length,
                    column: lines[lines.length - 1].length
                }
            });
            var slicedText = text.slice(RootDocument.range);
            assert.deepEqual(slicedText, text);
        });
    });
    /*
        Paragraph > Str
     */
    context("Node type is Paragraph", function() {
        var AST, rawValue;
        beforeEach(function() {
            rawValue = "string";
            AST = parse(rawValue);
        });
        context("Paragraph", function() {
            it("should has implemented TxtNode", function() {
                var node = findFirstTypedNode(AST, Syntax.Paragraph, rawValue);
                shouldHaveImplementTxtNode(node, rawValue);
            });
        });
        context("Text", function() {
            it("should has implemented TxtNode", function() {
                var node = findFirstTypedNode(AST, Syntax.Str, rawValue);
                shouldHaveImplementTxtNode(node, rawValue);
            });
        });

    });
    /*
        H1  > Str
     */
    context("Node type is Header", function() {
        /**
         * text
         * =====
         **/
        context("SetextHeader", function() {
            var AST, text, header;
            beforeEach(function() {
                text = "string";
                header = text + "\n======";
                AST = parse(header);
            });
            context("Header", function() {
                it("should has implemented TxtNode", function() {
                    var node = findFirstTypedNode(AST, Syntax.Header);
                    shouldHaveImplementTxtNode(node, header);
                });
            });
            context("Str", function() {
                it("should has implemented TxtNode", function() {
                    var node = findFirstTypedNode(AST, Syntax.Str);
                    shouldHaveImplementTxtNode(node, text);
                });
            });
        });
        /**
         * # text
         * */
        context("ATXHeader", function() {
            var AST, text, header;
            beforeEach(function() {
                text = "string";
                header = "# " + text;
                AST = parse(header);
            });
            context("Header", function() {
                it("should has implemented TxtNode", function() {
                    var node = findFirstTypedNode(AST, Syntax.Header);
                    shouldHaveImplementTxtNode(node, header);
                });
            });
            context("Str", function() {
                it("should have correct range", function() {
                    var node = findFirstTypedNode(AST, Syntax.Str);
                    shouldHaveImplementInlineTxtNode(node, text, header);
                });
            });
        });
    });
    context("Node type is Link", function() {
        var AST, rawValue, labelText;
        beforeEach(function() {
            labelText = "text";
            rawValue = "[" + labelText + "](http://example.com)";
            AST = parse(rawValue);
        });
        it("should has implemented TxtNode", function() {
            var node = findFirstTypedNode(AST, Syntax.Link);
            shouldHaveImplementTxtNode(node, rawValue);
        });
        context("Str", function() {
            it("should have correct range", function() {
                var node = findFirstTypedNode(AST, Syntax.Str);
                shouldHaveImplementInlineTxtNode(node, labelText, rawValue);
            });
        });
    });
    context("Node type is List", function() {
        it("should has implemented TxtNode", function() {
            var rawValue = "- list1\n- list2",
                AST = parse(rawValue);
            var node = findFirstTypedNode(AST, Syntax.List);
            shouldHaveImplementTxtNode(node, rawValue);
        });
    });
    context("Node type is ListItem", function() {
        it("should same the bullet_char", function() {
            var node, AST;
            AST = parse("- item");
            node = findFirstTypedNode(AST, Syntax.ListItem);
            assert(/^\-/.test(node.raw));
            AST = parse("* item");
            node = findFirstTypedNode(AST, Syntax.ListItem);
            assert(/^\*/.test(node.raw));
        });
        it("should have marker_offser of each items", function() {
            var node, AST;
            AST = parse("- item\n" +
                "   - item2");// second line should has offset
            node = findFirstTypedNode(AST, Syntax.ListItem, " - item2");
            assert(node);
            assert.equal(node.raw, " - item2");
        });
        it("should has implemented TxtNode", function() {
            var text = "text",
                rawValue = "- " + text,
                AST = parse(rawValue);
            var node = findFirstTypedNode(AST, Syntax.ListItem);
            shouldHaveImplementTxtNode(node, rawValue);
        });
        context("Str", function() {
            it("should have correct range", function() {
                var text = "text",
                    rawValue = "- " + text,
                    AST = parse(rawValue);
                var node = findFirstTypedNode(AST, Syntax.Str);
                shouldHaveImplementInlineTxtNode(node, text, rawValue);
            });
        });
    });
    /*
        > BlockQuote
    */
    context("Node type is BlockQuote", function() {
        var AST, rawValue, text;
        beforeEach(function() {
            text = "text";
            rawValue = "> " + text;
            AST = parse(rawValue);
        });
        it("should has implemented TxtNode", function() {
            var node = findFirstTypedNode(AST, Syntax.BlockQuote);
            assert.deepEqual(node.range, [0, rawValue.length]);
        });
    });
    /*
    ```
    CodeBlock
    ```
    */
    context("Node type is CodeBlock", function() {
        context("IndentCodeBlock", function() {
            var AST, rawValue, code;
            beforeEach(function() {
                code = "var code;";
                rawValue = "    \n" +
                    "    " + code +
                    "\n\n";
                AST = parse(rawValue);
            });
            it("should has implemented TxtNode", function() {
                var node = findFirstTypedNode(AST, Syntax.CodeBlock);
                assert(node.raw.indexOf(code) !== -1);
                var slicedCode = rawValue.slice(node.range[0], node.range[1]);
                assert.equal(slicedCode.trim(), code);
            });
        });
        context("FencedCode", function() {
            var AST, rawValue, code;
            beforeEach(function() {
                code = "var code;";
                rawValue = "```\n" +
                    code +
                    "\n```";
                AST = parse(rawValue);
            });
            it("should has implemented TxtNode", function() {
                var node = findFirstTypedNode(AST, Syntax.CodeBlock);
                var codeBlockRaw = rawValue;
                assert.equal(node.raw, codeBlockRaw);
                var slicedCode = rawValue.slice(node.range[0], node.range[1]);
                assert.equal(slicedCode, codeBlockRaw);
            });
        });

    });
    /*
        `code`
     */
    context("Node type is Code", function() {
        var AST, rawValue;
        beforeEach(function() {
            rawValue = "`code`";
            AST = parse(rawValue);
        });
        it("should has implemented TxtNode", function() {
            var node = findFirstTypedNode(AST, Syntax.Code);
            shouldHaveImplementTxtNode(node, rawValue);
        });
    });
    /*
        __Strong__
     */
    context("Node type is Strong", function() {
        var AST, rawValue, text;
        beforeEach(function() {
            text = "text";
            rawValue = "__" + text + "__";
            AST = parse(rawValue);
        });
        it("should has implemented TxtNode", function() {
            var node = findFirstTypedNode(AST, Syntax.Strong);
            shouldHaveImplementTxtNode(node, rawValue);
        });
        context("Str", function() {
            it("should have correct range", function() {
                var node = findFirstTypedNode(AST, Syntax.Str);
                shouldHaveImplementInlineTxtNode(node, text, rawValue);
            });
        });
    });

    /*
        ![text](http://example.com/a.png)
     */
    context("Node type is Image", function() {
        var AST, rawValue, labelText;
        beforeEach(function() {
            labelText = "text";
            rawValue = "![" + labelText + "](http://example.com/a.png)";
            AST = parse(rawValue);
        });
        it("should has implemented TxtNode", function() {
            var node = findFirstTypedNode(AST, Syntax.Image);
            shouldHaveImplementTxtNode(node, rawValue);
        });
    });
    /*
        *text*
    */
    context("Node type is Emphasis", function() {
        var AST, rawValue, text;
        beforeEach(function() {
            text = "text";
            rawValue = "*" + text + "*";
            AST = parse(rawValue);
        });
        it("should has implemented TxtNode", function() {
            var node = findFirstTypedNode(AST, Syntax.Emphasis);
            shouldHaveImplementTxtNode(node, rawValue);
        });
        context("Str", function() {
            it("should have correct range", function() {
                var node = findFirstTypedNode(AST, Syntax.Str);
                shouldHaveImplementInlineTxtNode(node, text, rawValue);
            });
        });
    });
    /*
    ----
    */
    context("Node type is HorizontalRule", function() {
        var AST, rawValue;
        beforeEach(function() {
            rawValue = "----";
            AST = parse(rawValue);
        });
        it("should has implemented TxtNode", function() {
            var node = findFirstTypedNode(AST, Syntax.HorizontalRule);
            shouldHaveImplementTxtNode(node, rawValue);
        });
    });
    /*
        <html>
     */
    context("Node type is Html", function() {
        var AST, rawValue;
        beforeEach(function() {
            rawValue = "<p>text</p>";
            AST = parse(rawValue);
        });
        it("should has implemented TxtNode", function() {
            var node = findFirstTypedNode(AST, Syntax.Html);
            shouldHaveImplementTxtNode(node, rawValue);
        });
    });
});
