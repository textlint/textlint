/*eslint-disable */
// LICENSE : MIT

// Based on commonmark's render:
// Copyright (c) 2014, John MacFarlane
// https://github.com/jgm/CommonMark/blob/master/js/lib/html-renderer.js

"use strict";
var traverse = require('traverse');
var positionNode = require("./markdown-position-node");
var StructuredSource = require('structured-source');
var Syntax = require("./markdown-syntax");
var stripYAMLHeader = require("strip-yaml-header");
var objectAssign = require("object-assign");
var commonmark = require("commonmark");
var reader = new commonmark.DocParser();

// Helper function to produce content in a pair of HTML tags.
var toMarkdownText = function (type, node, contents, selfclosing) {
    // TODO: All types has not been implemented yet...
    switch (type) {
        case "ListItem":
            console.log(node);
            return require("./type-builder/markdown-list-item")(node, contents);
        case "Link":
            return require("./type-builder/markdown-link")(node, contents);
    }
    return contents;
};

// Render an inline element as HTML.
var renderInline = function (inline, parent) {
    var attrs;
    switch (inline.t) {
        case 'Text':
            return this.escape(inline.c);
        case 'Softbreak':
            return this.softbreak;
        case 'Hardbreak':
            return toMarkdownText('br', [], "", true) + '\n';
        case 'Emph':
            return toMarkdownText('em', [], this.renderInlines(inline.c, parent));
        case 'Strong':
            return toMarkdownText('strong', [], this.renderInlines(inline.c, parent));
        case 'Html':
            return inline.c;
        case 'Link':
            return toMarkdownText('Link', inline, this.renderInlines(inline.label, parent));
        case 'Image':
            attrs = [
                ['src', this.escape(inline.destination, true)],
                [
                    'alt', this.renderInlines(inline.label, parent).
                    replace(/\<[^>]*alt="([^"]*)"[^>]*\>/g, '$1').
                    replace(/\<[^>]*\>/g, '')
                ]
            ];
            if (inline.title) {
                attrs.push(['title', this.escape(inline.title, true)]);
            }
            return toMarkdownText('img', attrs, "", true);
        case 'Code':
            return toMarkdownText('code', [], this.escape(inline.c));
        default:
            console.log("Unknown inline type " + inline.t);
            return "";
    }
};
// Render a list of inlines.
var renderInlines = function (inlines, parent) {
    var result = '';
    for (var i = 0; i < inlines.length; i++) {
        var inline = inlines[i];
        if (parent != null) {
            Object.defineProperties(inline, {
                "start_line": {
                    value: parent.start_line
                },
                "start_column": {
                    value: parent.start_column + result.length
                }
            });
        }
        // render plaintext
        var raw = this.renderInline(inline, parent);
        result = result + raw;

        if (parent != null) {
            var addingLineNumber = (result.split("\n").length - 1);
            Object.defineProperties(inline, {
                "end_line": {
                    value: parent.start_line + addingLineNumber
                }
            });
            // export `raw`
            inline.raw = raw
        }
    }
    return result;
};

// Render a single block element.
var renderBlock = function (block, in_tight_list) {
    var tag;
    var attr;
    var info_words;
    switch (block.t) {
        case 'Document':
            var whole_doc = this.renderBlocks(block.children);
            return (whole_doc === '' ? '' : whole_doc + '\n');
        case 'Paragraph':
            if (in_tight_list) {
                return this.renderInlines(block.inline_content, block);
            } else {
                return toMarkdownText('p', [], this.renderInlines(block.inline_content, block));
            }
            break;
        case 'BlockQuote':
            var filling = this.renderBlocks(block.children);
            return toMarkdownText('blockquote', [], filling === '' ? this.innersep :
                                                    this.innersep + filling + this.innersep);
        case 'ListItem':
            return toMarkdownText('ListItem', block, this.renderBlocks(block.children, in_tight_list).trim());
        case 'List':
            tag = block.list_data.type == 'Bullet' ? 'ul' : 'ol';
            attr = (!block.list_data.start || block.list_data.start == 1) ?
                   [] : [['start', block.list_data.start.toString()]];
            return toMarkdownText(tag, attr, this.innersep +
            this.renderBlocks(block.children, block.tight) +
            this.innersep);
        case 'Header':
            tag = 'h' + block.level;
            return toMarkdownText(tag, [], this.renderInlines(block.inline_content, block));
        case 'IndentedCode':
            return toMarkdownText('pre', [],
                toMarkdownText('code', [], this.escape(block.string_content)));
        case 'FencedCode':
            info_words = block.info.split(/ +/);
            attr = info_words.length === 0 || info_words[0].length === 0 ?
                   [] : [
                [
                    'class', 'language-' +
                this.escape(info_words[0], true)
                ]
            ];
            return toMarkdownText('pre', [],
                toMarkdownText('code', attr, this.escape(block.string_content)));
        case 'HtmlBlock':
            return block.string_content;
        case 'ReferenceDef':
            return "";
        case 'HorizontalRule':
            return toMarkdownText('hr', [], "", true);
        default:
            console.log("Unknown block type " + block.t);
            return "";
    }
};

// Render a list of block elements, separated by this.blocksep.
var renderBlocks = function (blocks, in_tight_list) {
    var result = [];
    for (var i = 0; i < blocks.length; i++) {
        var block = blocks[i];
        if (block.t !== 'ReferenceDef') {
            var raw = this.renderBlock(block, in_tight_list);
            // Mutable Change!!
            // export `raw` property
            block.raw = raw;
            result.push(raw);
        }
    }
    return result.join(this.blocksep);
};

// The HtmlRenderer object.
function HtmlRenderer() {
    return {
        // default options:
        blocksep: '\n',  // space between blocks
        innersep: '\n',  // space between block container tag and contents
        softbreak: '\n', // by default, soft breaks are rendered as newlines in HTML
        // set to "<br />" to make them hard breaks
        // set to " " if you want to ignore line wrapping in source
        escape: function (s, preserve_entities) {
            if (preserve_entities) {
                return s.replace(/[&](?![#](x[a-f0-9]{1,8}|[0-9]{1,8});|[a-z][a-z0-9]{1,31};)/gi, '&amp;')
                    .replace(/[<]/g, '&lt;')
                    .replace(/[>]/g, '&gt;')
                    .replace(/["]/g, '&quot;');
            } else {
                return s.replace(/[&]/g, '&amp;')
                    .replace(/[<]/g, '&lt;')
                    .replace(/[>]/g, '&gt;')
                    .replace(/["]/g, '&quot;');
            }
        },
        renderInline: renderInline,
        renderInlines: renderInlines,
        renderBlock: renderBlock,
        renderBlocks: renderBlocks,
        computeAST: renderBlock
    };
}

/**
 * parse markdown text and return ast mapped location info.
 * @param {string} text
 * @returns {TxtNode}
 */
function parse(text) {
    var writer = new HtmlRenderer();
    var ast = reader.parse(stripYAMLHeader(text));
    // affect to ast
    writer.computeAST(ast);
    var src = new StructuredSource(text);

    // assign text to `raw` property on Root = Document Node
    ast.raw = text;

    // compute location from each nodes.
    // This do merge(node, loc)
    traverse(ast).forEach(function (x) {
        if (this.notLeaf) {
            x = objectAssign(x, positionNode(x));
            if (x.loc) {
                x.range = src.locationToRange(x.loc);
            }
            if (typeof x.t !== "undefined") {
                // covert t to type
                // e.g) "FencedCode" => "CodeBlock"
                x.type = Syntax[x.t];
                // delete original `x.t`
                //delete x.t;
            }
        }
    });
    return ast;
}
module.exports = parse;