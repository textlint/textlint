// LICENSE : MIT
// Base:
// Copyright (c) 2014, John MacFarlane
// https://github.com/jgm/CommonMark/blob/master/js/lib/html-renderer.js

"use strict";

var commonmark = require("commonmark");
var objectAssign = require("object-assign");
var reader = new commonmark.DocParser();

// Helper function to produce content in a pair of HTML tags.
var toPlainText = function (tag, attribs, contents, selfclosing) {
    return contents;
};

// Render an inline element as HTML.
var renderInline = function (inline, parent) {
    var attrs;
    switch (inline.t) {
        case 'Str':
            return this.escape(inline.c);
        case 'Softbreak':
            return this.softbreak;
        case 'Hardbreak':
            return toPlainText('br', [], "", true) + '\n';
        case 'Emph':
            return toPlainText('em', [], this.renderInlines(inline.c, parent));
        case 'Strong':
            return toPlainText('strong', [], this.renderInlines(inline.c, parent));
        case 'Html':
            return inline.c;
        case 'Link':
            attrs = [['href', this.escape(inline.destination, true)]];
            if (inline.title) {
                attrs.push(['title', this.escape(inline.title, true)]);
            }
            return toPlainText('a', attrs, this.renderInlines(inline.label, parent));
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
            return toPlainText('img', attrs, "", true);
        case 'Code':
            return toPlainText('code', [], this.escape(inline.c));
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
                },
                "raw": {
                    value: raw
                }
            });
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
                return toPlainText('p', [], this.renderInlines(block.inline_content, block));
            }
            break;
        case 'BlockQuote':
            var filling = this.renderBlocks(block.children);
            return toPlainText('blockquote', [], filling === '' ? this.innersep :
                                                 this.innersep + filling + this.innersep);
        case 'ListItem':
            return toPlainText('li', [], this.renderBlocks(block.children, in_tight_list).trim());
        case 'List':
            tag = block.list_data.type == 'Bullet' ? 'ul' : 'ol';
            attr = (!block.list_data.start || block.list_data.start == 1) ?
                   [] : [['start', block.list_data.start.toString()]];
            return toPlainText(tag, attr, this.innersep +
            this.renderBlocks(block.children, block.tight) +
            this.innersep);
        case 'ATXHeader':
        case 'SetextHeader':
            tag = 'h' + block.level;
            return toPlainText(tag, [], this.renderInlines(block.inline_content, block));
        case 'IndentedCode':
            return toPlainText('pre', [],
                toPlainText('code', [], this.escape(block.string_content)));
        case 'FencedCode':
            info_words = block.info.split(/ +/);
            attr = info_words.length === 0 || info_words[0].length === 0 ?
                   [] : [
                [
                    'class', 'language-' +
                this.escape(info_words[0], true)
                ]
            ];
            return toPlainText('pre', [],
                toPlainText('code', attr, this.escape(block.string_content)));
        case 'HtmlBlock':
            return block.string_content;
        case 'ReferenceDef':
            return "";
        case 'HorizontalRule':
            return toPlainText('hr', [], "", true);
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
            // assign `raw` property - readonly
            Object.defineProperty(block, "raw", {
                value: raw
            });
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
        render: renderBlock
    };
}

function parse(text) {
    var traverse = require('traverse');
    var positionNode = require("./position-node");
    var writer = new HtmlRenderer();
    var ast = reader.parse(text);
    var render = writer.render(ast);
    traverse(ast).forEach(function (x) {
        if (this.notLeaf) {
            x = objectAssign(x, positionNode(x));
        }
    });
    return ast;
}
module.exports = parse;