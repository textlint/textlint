/*eslint-disable */
// LICENSE : MIT

// Based on commonmark's render:
// Copyright (c) 2014, John MacFarlane
// https://github.com/jgm/CommonMark/blob/master/js/lib/html-renderer.js

"use strict";
var traverse = require('traverse');
var positionNode = require("./markdown-position-node");
var StructuredSource = require('structured-source');
var CMSyntax = require("./mapping/common-markdown-syntax");
var stripYAMLHeader = require("strip-yaml-header");
var objectAssign = require("object-assign");
var commonmark = require("commonmark");
var reader = new commonmark.DocParser();

// block elements by level
var _levelList = [],
// texts line by line
    _textLines = [];
function initialize() {
    _levelList = [];
    _textLines = [];
}

function getAncestors() {
    var i, iz, result;
    result = [];
    for (i = 1, iz = _levelList.length; i < iz; ++i) {
        result.push(_levelList[i]);
    }
    return result;
}

function getParent(node) {
    var parents = getAncestors();
    for (var i = parents.length - 1; i >= 0; i--) {
        var parent = parents[i];
        if (parent !== node) {
            return parent;
        }
    }
}

// Helper function to produce markdown text
function toMarkdownText(type, node, contents) {
    // TODO: All types has not been implemented yet...
    switch (type) {
        case CMSyntax.Header:
            return _textLines[node.start_line - 1];
        case CMSyntax.ListItem:
            return _textLines[node.start_line - 1];
        case CMSyntax.Link:
            return require("./type-builder/markdown-link")(node, contents);
        case CMSyntax.Image:
            return require("./type-builder/markdown-image")(node, contents);
        case CMSyntax.BlockQuote:
            return contents;
        case CMSyntax.CodeBlock:
            return contents;
        case CMSyntax.Code:
            return require("./type-builder/markdown-code")(node, contents);
        case CMSyntax.Strong:
            return require("./type-builder/markdown-strong")(node, contents);
        case CMSyntax.Emph:
            return require("./type-builder/markdown-Emph")(node, contents);
    }
    return contents;
}

// Render an inline element as HTML.
var renderInline = function (inline, parent) {

    switch (inline.t) {
        case 'Text':
            return inline.c;
        case 'Softbreak':
            return this.softbreak;
        case 'Hardbreak':
            return toMarkdownText('br', [], "", true) + '\n';
        case CMSyntax.Emph:
            return toMarkdownText(CMSyntax.Emph, inline, this.renderInlines(inline.c, inline));
        case CMSyntax.Strong:
            return toMarkdownText(CMSyntax.Strong, inline, this.renderInlines(inline.c, inline));
        case 'Html':
            return inline.c;
        case CMSyntax.Link:
            return toMarkdownText(CMSyntax.Link, inline, this.renderInlines(inline.label, inline));
        case CMSyntax.Image:
            return toMarkdownText(CMSyntax.Image, inline, this.renderInlines(inline.label, inline));
        case CMSyntax.Code:
            return toMarkdownText(CMSyntax.Code, inline, inline.c);
        default:
            throw new Error("Unknown inline type " + inline.t);
            return "";
    }
};
function marginLeft(parent) {
    if (typeof parent !== "object") {
        return 0;
    }

    switch (parent.t) {
        case CMSyntax.Header:
            // workaround : 0.15
            // Why does a child node of header start with column 1?
            return parent.level + 1;
        // TODO: How to know * or __ ?
        case CMSyntax.Emph:
            return 1;
        case CMSyntax.Strong:
            return 2;
        case CMSyntax.Link:
            return 1;
        case CMSyntax.Image:
            return 2;

    }
    return 0;// default - no effect
}
// Render a list of inlines.
var renderInlines = function (inlines, parent) {
    var result = '';
    // parent node is like header or list has start margin
    // e.g.)
    // # header
    // `start_column` should be 2
    var start_margin = marginLeft(parent);
    for (var i = 0; i < inlines.length; i++) {
        var inline = inlines[i];
        if (parent != null) {
            // attach pre-location info to node
            inline["start_line"] = parent.start_line;
            inline["start_column"] = parent.start_column + start_margin + result.length;
        }
        // render plaintext
        var raw = this.renderInline(inline, parent);
        result = result + raw;
        if (parent != null) {
            // export `raw`
            inline.raw = raw
        }
    }
    return result;
};

// Render a single block element.
var renderBlock = function (block, in_tight_list) {
    var tag;
    switch (block.t) {
        case 'Document':
            // add block to stack +1
            _levelList.push(block);
            var whole_doc = this.renderBlocks(block.children);
            // pop block from stack -1
            _levelList.pop();
            return (whole_doc === '' ? '' : whole_doc + '\n');
        case 'Paragraph':
            if (in_tight_list) {
                return this.renderInlines(block.inline_content, block);
            } else {
                return toMarkdownText('p', [], this.renderInlines(block.inline_content, block));
            }
            break;
        case CMSyntax.BlockQuote:
            // add block to stack +1
            _levelList.push(block);
            var filling = this.renderBlocks(block.children);
            // pop block from stack -1
            _levelList.pop();
            return toMarkdownText(CMSyntax.BlockQuote, block, filling);
        case CMSyntax.ListItem:
            // add block to stack +1
            _levelList.push(block);
            var result = toMarkdownText(CMSyntax.ListItem, block, this.renderBlocks(block.children, in_tight_list).trim());
            // pop block from stack -1
            _levelList.pop();
            return result;
        case CMSyntax.List:
            // add block to stack +1
            _levelList.push(block);
            var contents = this.renderBlocks(block.children, block.tight);
            var result = toMarkdownText(CMSyntax.List, block, contents);
            // pop block from stack -1
            _levelList.pop();
            return result;
        case CMSyntax.Header:
            tag = 'h' + block.level;
            return toMarkdownText(CMSyntax.Header, block, this.renderInlines(block.inline_content, block));
        case CMSyntax.CodeBlock:
            return toMarkdownText(CMSyntax.CodeBlock, block, block.string_content);
        case 'HtmlBlock':
            return block.string_content;
        case 'ReferenceDef':
            return "";
        case 'HorizontalRule':
            return toMarkdownText('hr', [], "", true);
        default:
            throw new Error("Unknown block type " + block.t);
            return "";
    }
};

// Render a list of block elements, separated by this.blocksep.
var renderBlocks = function (blocks, in_tight_list) {
    var result = [];
    for (var i = 0; i < blocks.length; i++) {
        var block = blocks[i];
        if (block.t !== 'ReferenceDef') {
            // Mutable Change!!
            // export `raw` property
            var raw = this.renderBlock(block, in_tight_list);
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
 * Remove undocumented properties on TxtNode from node
 * @param {TxtNode} node already has loc,range
 */
function removeUnusedProperties(node) {
    if (typeof node !== "object") {
        return;
    }
    ["start_line", "end_line", "start_column", "t"].forEach(function (key) {
        if (node.hasOwnProperty(key)) {
            delete node[key];
        }
    });
}

/**
 * parse markdown text and return ast mapped location info.
 * @param {string} text
 * @returns {TxtNode}
 */
function parse(text) {
    // initialize internal property.
    initialize();
    var src = new StructuredSource(text);
    _textLines = text.split("\n");

    var SyntaxMap = require("./mapping/markdown-syntax-map");
    var writer = new HtmlRenderer();
    var ast = reader.parse(stripYAMLHeader(text));
    // affect to ast
    writer.computeAST(ast);

    // assign text to `raw` property on Root = Document Node
    ast.raw = text;

    // compute location from each nodes.
    // This do merge(node, loc)
    traverse(ast).forEach(function (node) {
        if (this.notLeaf) {
            node = objectAssign(node, positionNode(node));
            if (node.loc) {
                node.range = src.locationToRange(node.loc);
            }
            if (typeof node.t !== "undefined") {
                // covert t to type
                // e.g) "FencedCode" => "CodeBlock"
                node.type = SyntaxMap[node.t];
            }
            removeUnusedProperties(node);
        }
    });
    return ast;
}
module.exports = {
    parse: parse,
    Syntax: require("./union-syntax")
};