(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// LICENSE : MIT
"use strict";
var input = document.getElementById("js-input"),
    output = document.getElementById("js-output");
var parser = require("../../lib/markdown/markdown-parser").parse;
input.addEventListener("keyup", function (event) {
    var value = event.target.value;
    var AST = parser(value);
    output.value = JSON.stringify(AST, null, 4);
});
},{"../../lib/markdown/markdown-parser":4}],2:[function(require,module,exports){
// LICENSE : MIT
"use strict";
// This is Syntax map of CommonMarkdown AST.
// Difference from markdown-syntax.js
var exports = {
    "Document": "Document",
    "Paragraph": "Paragraph",
    "BlockQuote": "BlockQuote",
    "ListItem": "ListItem",
    "List": "List",
    "Bullet": "Bullet",
    "Header": "Header",
    "CodeBlock": "CodeBlock",
    "ReferenceDef": "ReferenceDef",
    "HorizontalRule": "HorizontalRule",
    // inline block
    'Text': 'Text',
    'Softbreak': 'Softbreak',
    'Hardbreak': 'Hardbreak',
    'Emph': 'Emph',
    'Strong': 'Strong',
    'Html': 'Html',
    'Link': 'Link',
    'Image': 'Image',
    'Code': 'Code'
};
module.exports = exports;
},{}],3:[function(require,module,exports){
// LICENSE : MIT
"use strict";
// Replace key to value mapping
// This is not for Constants.
var exports = {
    "Document": "Document",
    "Paragraph": "Paragraph",
    "BlockQuote": "BlockQuote",
    "ListItem": "ListItem",
    "List": "List",
    "Bullet": "Bullet", // no need?
    "Header": "Header",
    "CodeBlock":"CodeBlock",
    "HtmlBlock": "HtmlBlock",
    "ReferenceDef": "ReferenceDef",
    "HorizontalRule": "HorizontalRule",
    // inline block
    'Text': 'Str',
    'Softbreak': 'Break',
    'Hardbreak': 'Break',
    'Emph': 'Emphasis',
    'Strong': 'Strong',
    'Html': 'Html',
    'Link': 'Link',
    'Image': 'Image',
    'Code': 'Code'
};
module.exports = exports;
},{}],4:[function(require,module,exports){
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
            Object.defineProperties(inline, {
                "start_line": {
                    value: parent.start_line
                },
                "start_column": {
                    value: parent.start_column + start_margin + result.length
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
            tag = block.list_data.type == 'Bullet' ? 'ul' : 'ol';
            var contents = this.innersep +
                this.renderBlocks(block.children, block.tight) +
                this.innersep;
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
    traverse(ast).forEach(function (x) {
        if (this.notLeaf) {
            x = objectAssign(x, positionNode(x));
            if (x.loc) {
                x.range = src.locationToRange(x.loc);
            }
            if (typeof x.t !== "undefined") {
                // covert t to type
                // e.g) "FencedCode" => "CodeBlock"
                x.type = SyntaxMap[x.t];
                // delete original `x.t`
                delete x.t;
            }
        }
    });
    return ast;
}
module.exports = {
    parse: parse,
    Syntax: require("./union-syntax")
};
},{"./mapping/common-markdown-syntax":2,"./mapping/markdown-syntax-map":3,"./markdown-position-node":5,"./type-builder/markdown-Emph":18,"./type-builder/markdown-code":19,"./type-builder/markdown-image":20,"./type-builder/markdown-link":21,"./type-builder/markdown-strong":22,"./union-syntax":23,"commonmark":10,"object-assign":12,"strip-yaml-header":13,"structured-source":14,"traverse":17}],5:[function(require,module,exports){
// LICENSE : MIT
"use strict";

// location information example:
/*
    "loc": {
        "start": {
            "line": 2,
            "column": 0
        },
        "end": {
            "line": 2,
            "column": 19
        }
    }
*/

var CMSyntax = require("./mapping/common-markdown-syntax");
/**
 * Compute location info from node position and `raw` value.
 * if the computation is success, then return location object.
 * if the computation is failure, then return node of arguments.
 * @param {TxtNode} node  node has to have `start_line`, `start_column, `raw`
 * @returns {object} location object
 */
module.exports = function (node) {
    if (typeof node.start_line === "undefined" ||
        typeof node.start_column === "undefined" ||
        typeof node.raw === "undefined") {
        return node;
    }
    var LINEBREAKE_MARK = /\r?\n/g;
    var lines = node.raw.split(LINEBREAKE_MARK);
    var addingColumn = lines.length - 1;


    // https://github.com/Constellation/structured-source
    // say that
    // > Line number starts with 1.
    // > Column number starts with 0.
    // But, Column number must starts with 1 in CommonMark AST.
    // => CommonMark's column number - 1.
    var columnMargin = 1;
    var lastLine = lines[addingColumn];
    // location info
    var loc = {};


    var end_column;
    if (addingColumn > 0) {
        end_column = Math.max(lastLine.length - columnMargin, 0);
    } else {
        end_column = Math.max(node.start_column + lastLine.length - columnMargin, 0);
    }
    // if FencedCode
    if (node.t === CMSyntax.CodeBlock && typeof node.info !== "undefined") {
        loc["start"] = {
            line: node.start_line + 1,
            column: node.start_column - columnMargin
        };
        loc["end"] = {
            line: node.start_line + addingColumn + 1,
            column: end_column
        };
    } else {
        loc["start"] = {
            line: node.start_line,
            column: node.start_column - columnMargin
        };
        loc["end"] = {
            line: node.start_line + addingColumn,
            column: end_column
        };
    }

    return {loc: loc};
};
},{"./mapping/common-markdown-syntax":2}],6:[function(require,module,exports){
var C_GREATERTHAN = 62;
var C_SPACE = 32;
var C_OPEN_BRACKET = 91;

var InlineParser = require('./inlines');
var unescapeString = new InlineParser().unescapeString;

// Returns true if string contains only space characters.
var isBlank = function(s) {
    return /^\s*$/.test(s);
};

// Convert tabs to spaces on each line using a 4-space tab stop.
var detabLine = function(text) {
    if (text.indexOf('\t') === -1) {
        return text;
    } else {
        var lastStop = 0;
        return text.replace(/\t/g, function(match, offset) {
            var result = '    '.slice((offset - lastStop) % 4);
            lastStop = offset + 1;
            return result;
        });
    }
};

// Attempt to match a regex in string s at offset offset.
// Return index of match or -1.
var matchAt = function(re, s, offset) {
    var res = s.slice(offset).match(re);
    if (res) {
        return offset + res.index;
    } else {
        return -1;
    }
};

var BLOCKTAGNAME = '(?:article|header|aside|hgroup|iframe|blockquote|hr|body|li|map|button|object|canvas|ol|caption|output|col|p|colgroup|pre|dd|progress|div|section|dl|table|td|dt|tbody|embed|textarea|fieldset|tfoot|figcaption|th|figure|thead|footer|footer|tr|form|ul|h1|h2|h3|h4|h5|h6|video|script|style)';
var HTMLBLOCKOPEN = "<(?:" + BLOCKTAGNAME + "[\\s/>]" + "|" +
        "/" + BLOCKTAGNAME + "[\\s>]" + "|" + "[?!])";
var reHtmlBlockOpen = new RegExp('^' + HTMLBLOCKOPEN, 'i');

var reHrule = /^(?:(?:\* *){3,}|(?:_ *){3,}|(?:- *){3,}) *$/;


// DOC PARSER

// These are methods of a DocParser object, defined below.

var makeBlock = function(tag, start_line, start_column) {
    return { t: tag,
             open: true,
             last_line_blank: false,
             start_line: start_line,
             start_column: start_column,
             end_line: start_line,
             children: [],
             parent: null,
             // string_content is formed by concatenating strings, in finalize:
             string_content: "",
             strings: [],
             inline_content: []
           };
};

// Returns true if parent block can contain child block.
var canContain = function(parent_type, child_type) {
    return ( parent_type === 'Document' ||
             parent_type === 'BlockQuote' ||
             parent_type === 'ListItem' ||
             (parent_type === 'List' && child_type === 'ListItem') );
};

// Returns true if block type can accept lines of text.
var acceptsLines = function(block_type) {
    return ( block_type === 'Paragraph' ||
             block_type === 'IndentedCode' ||
             block_type === 'FencedCode' );
};

// Returns true if block ends with a blank line, descending if needed
// into lists and sublists.
var endsWithBlankLine = function(block) {
    if (block.last_line_blank) {
        return true;
    }
    if ((block.t === 'List' || block.t === 'ListItem') && block.children.length > 0) {
        return endsWithBlankLine(block.children[block.children.length - 1]);
    } else {
        return false;
    }
};

// Break out of all containing lists, resetting the tip of the
// document to the parent of the highest list, and finalizing
// all the lists.  (This is used to implement the "two blank lines
// break of of all lists" feature.)
var breakOutOfLists = function(block, line_number) {
    var b = block;
    var last_list = null;
    do {
        if (b.t === 'List') {
            last_list = b;
        }
        b = b.parent;
    } while (b);

    if (last_list) {
        while (block !== last_list) {
            this.finalize(block, line_number);
            block = block.parent;
        }
        this.finalize(last_list, line_number);
        this.tip = last_list.parent;
    }
};

// Add a line to the block at the tip.  We assume the tip
// can accept lines -- that check should be done before calling this.
var addLine = function(ln, offset) {
    var s = ln.slice(offset);
    if (!(this.tip.open)) {
        throw { msg: "Attempted to add line (" + ln + ") to closed container." };
    }
    this.tip.strings.push(s);
};

// Add block of type tag as a child of the tip.  If the tip can't
// accept children, close and finalize it and try its parent,
// and so on til we find a block that can accept children.
var addChild = function(tag, line_number, offset) {
    while (!canContain(this.tip.t, tag)) {
        this.finalize(this.tip, line_number);
    }

    var column_number = offset + 1; // offset 0 = column 1
    var newBlock = makeBlock(tag, line_number, column_number);
    this.tip.children.push(newBlock);
    newBlock.parent = this.tip;
    this.tip = newBlock;
    return newBlock;
};

// Parse a list marker and return data on the marker (type,
// start, delimiter, bullet character, padding) or null.
var parseListMarker = function(ln, offset) {
    var rest = ln.slice(offset);
    var match;
    var spaces_after_marker;
    var data = {};
    if (rest.match(reHrule)) {
        return null;
    }
    if ((match = rest.match(/^[*+-]( +|$)/))) {
        spaces_after_marker = match[1].length;
        data.type = 'Bullet';
        data.bullet_char = match[0][0];

    } else if ((match = rest.match(/^(\d+)([.)])( +|$)/))) {
        spaces_after_marker = match[3].length;
        data.type = 'Ordered';
        data.start = parseInt(match[1]);
        data.delimiter = match[2];
    } else {
        return null;
    }
    var blank_item = match[0].length === rest.length;
    if (spaces_after_marker >= 5 ||
        spaces_after_marker < 1 ||
        blank_item) {
        data.padding = match[0].length - spaces_after_marker + 1;
    } else {
        data.padding = match[0].length;
    }
    return data;
};

// Returns true if the two list items are of the same type,
// with the same delimiter and bullet character.  This is used
// in agglomerating list items into lists.
var listsMatch = function(list_data, item_data) {
    return (list_data.type === item_data.type &&
            list_data.delimiter === item_data.delimiter &&
            list_data.bullet_char === item_data.bullet_char);
};

// Analyze a line of text and update the document appropriately.
// We parse markdown text by calling this on each line of input,
// then finalizing the document.
var incorporateLine = function(ln, line_number) {

    var all_matched = true;
    var last_child;
    var first_nonspace;
    var offset = 0;
    var match;
    var data;
    var blank;
    var indent;
    var last_matched_container;
    var i;
    var CODE_INDENT = 4;

    var container = this.doc;
    var oldtip = this.tip;

    // Convert tabs to spaces:
    ln = detabLine(ln);

    // For each containing block, try to parse the associated line start.
    // Bail out on failure: container will point to the last matching block.
    // Set all_matched to false if not all containers match.
    while (container.children.length > 0) {
        last_child = container.children[container.children.length - 1];
        if (!last_child.open) {
            break;
        }
        container = last_child;

        match = matchAt(/[^ ]/, ln, offset);
        if (match === -1) {
            first_nonspace = ln.length;
            blank = true;
        } else {
            first_nonspace = match;
            blank = false;
        }
        indent = first_nonspace - offset;

        switch (container.t) {
        case 'BlockQuote':
            if (indent <= 3 && ln.charCodeAt(first_nonspace) === C_GREATERTHAN) {
                offset = first_nonspace + 1;
                if (ln.charCodeAt(offset) === C_SPACE) {
                    offset++;
                }
            } else {
                all_matched = false;
            }
            break;

        case 'ListItem':
            if (indent >= container.list_data.marker_offset +
                container.list_data.padding) {
                offset += container.list_data.marker_offset +
                    container.list_data.padding;
            } else if (blank) {
                offset = first_nonspace;
            } else {
                all_matched = false;
            }
            break;

        case 'IndentedCode':
            if (indent >= CODE_INDENT) {
                offset += CODE_INDENT;
            } else if (blank) {
                offset = first_nonspace;
            } else {
                all_matched = false;
            }
            break;

        case 'Header':
        case 'HorizontalRule':
            // a header can never container > 1 line, so fail to match:
            all_matched = false;
            if (blank) {
                container.last_line_blank = true;
            }
            break;

        case 'FencedCode':
            // skip optional spaces of fence offset
            i = container.fence_offset;
            while (i > 0 && ln.charCodeAt(offset) === C_SPACE) {
                offset++;
                i--;
            }
            break;

        case 'HtmlBlock':
            if (blank) {
                container.last_line_blank = true;
                all_matched = false;
            }
            break;

        case 'Paragraph':
            if (blank) {
                container.last_line_blank = true;
                all_matched = false;
            }
            break;

        default:
        }

        if (!all_matched) {
            container = container.parent; // back up to last matching block
            break;
        }
    }

    last_matched_container = container;

    // This function is used to finalize and close any unmatched
    // blocks.  We aren't ready to do this now, because we might
    // have a lazy paragraph continuation, in which case we don't
    // want to close unmatched blocks.  So we store this closure for
    // use later, when we have more information.
    var closeUnmatchedBlocks = function(mythis) {
        var already_done = false;
        // finalize any blocks not matched
        while (!already_done && oldtip !== last_matched_container) {
            mythis.finalize(oldtip, line_number);
            oldtip = oldtip.parent;
        }
        already_done = true;
    };

    // Check to see if we've hit 2nd blank line; if so break out of list:
    if (blank && container.last_line_blank) {
        this.breakOutOfLists(container, line_number);
    }

    // Unless last matched container is a code block, try new container starts,
    // adding children to the last matched container:
    while (container.t !== 'FencedCode' &&
           container.t !== 'IndentedCode' &&
           container.t !== 'HtmlBlock' &&
           // this is a little performance optimization:
           matchAt(/^[ #`~*+_=<>0-9-]/, ln, offset) !== -1) {

        match = matchAt(/[^ ]/, ln, offset);
        if (match === -1) {
            first_nonspace = ln.length;
            blank = true;
        } else {
            first_nonspace = match;
            blank = false;
        }
        indent = first_nonspace - offset;

        if (indent >= CODE_INDENT) {
            // indented code
            if (this.tip.t !== 'Paragraph' && !blank) {
                offset += CODE_INDENT;
                closeUnmatchedBlocks(this);
                container = this.addChild('IndentedCode', line_number, offset);
            } else { // indent > 4 in a lazy paragraph continuation
                break;
            }

        } else if (ln.charCodeAt(first_nonspace) === C_GREATERTHAN) {
            // blockquote
            offset = first_nonspace + 1;
            // optional following space
            if (ln.charCodeAt(offset) === C_SPACE) {
                offset++;
            }
            closeUnmatchedBlocks(this);
            container = this.addChild('BlockQuote', line_number, offset);

        } else if ((match = ln.slice(first_nonspace).match(/^#{1,6}(?: +|$)/))) {
            // ATX header
            offset = first_nonspace + match[0].length;
            closeUnmatchedBlocks(this);
            container = this.addChild('Header', line_number, first_nonspace);
            container.level = match[0].trim().length; // number of #s
            // remove trailing ###s:
            container.strings =
                [ln.slice(offset).replace(/^ *#+ *$/, '').replace(/ +#+ *$/, '')];
            break;

        } else if ((match = ln.slice(first_nonspace).match(/^`{3,}(?!.*`)|^~{3,}(?!.*~)/))) {
            // fenced code block
            var fence_length = match[0].length;
            closeUnmatchedBlocks(this);
            container = this.addChild('FencedCode', line_number, first_nonspace);
            container.fence_length = fence_length;
            container.fence_char = match[0][0];
            container.fence_offset = first_nonspace - offset;
            offset = first_nonspace + fence_length;
            break;

        } else if (matchAt(reHtmlBlockOpen, ln, first_nonspace) !== -1) {
            // html block
            closeUnmatchedBlocks(this);
            container = this.addChild('HtmlBlock', line_number, first_nonspace);
            // note, we don't adjust offset because the tag is part of the text
            break;

        } else if (container.t === 'Paragraph' &&
                   container.strings.length === 1 &&
                   ((match = ln.slice(first_nonspace).match(/^(?:=+|-+) *$/)))) {
            // setext header line
            closeUnmatchedBlocks(this);
            container.t = 'Header'; // convert Paragraph to SetextHeader
            container.level = match[0][0] === '=' ? 1 : 2;
            offset = ln.length;

        } else if (matchAt(reHrule, ln, first_nonspace) !== -1) {
            // hrule
            closeUnmatchedBlocks(this);
            container = this.addChild('HorizontalRule', line_number, first_nonspace);
            offset = ln.length - 1;
            break;

        } else if ((data = parseListMarker(ln, first_nonspace))) {
            // list item
            closeUnmatchedBlocks(this);
            data.marker_offset = indent;
            offset = first_nonspace + data.padding;

            // add the list if needed
            if (container.t !== 'List' ||
                !(listsMatch(container.list_data, data))) {
                container = this.addChild('List', line_number, first_nonspace);
                container.list_data = data;
            }

            // add the list item
            container = this.addChild('ListItem', line_number, first_nonspace);
            container.list_data = data;

        } else {
            break;

        }

        if (acceptsLines(container.t)) {
            // if it's a line container, it can't contain other containers
            break;
        }
    }

    // What remains at the offset is a text line.  Add the text to the
    // appropriate container.

    match = matchAt(/[^ ]/, ln, offset);
    if (match === -1) {
        first_nonspace = ln.length;
        blank = true;
    } else {
        first_nonspace = match;
        blank = false;
    }
    indent = first_nonspace - offset;

    // First check for a lazy paragraph continuation:
    if (this.tip !== last_matched_container &&
        !blank &&
        this.tip.t === 'Paragraph' &&
        this.tip.strings.length > 0) {
        // lazy paragraph continuation

        this.last_line_blank = false;
        this.addLine(ln, offset);

    } else { // not a lazy continuation

        // finalize any blocks not matched
        closeUnmatchedBlocks(this);

        // Block quote lines are never blank as they start with >
        // and we don't count blanks in fenced code for purposes of tight/loose
        // lists or breaking out of lists.  We also don't set last_line_blank
        // on an empty list item.
        container.last_line_blank = blank &&
            !(container.t === 'BlockQuote' ||
              container.t === 'Header' ||
              container.t === 'FencedCode' ||
              (container.t === 'ListItem' &&
               container.children.length === 0 &&
               container.start_line === line_number));

        var cont = container;
        while (cont.parent) {
            cont.parent.last_line_blank = false;
            cont = cont.parent;
        }

        switch (container.t) {
        case 'IndentedCode':
        case 'HtmlBlock':
            this.addLine(ln, offset);
            break;

        case 'FencedCode':
            // check for closing code fence:
            match = (indent <= 3 &&
                     ln.charAt(first_nonspace) === container.fence_char &&
                     ln.slice(first_nonspace).match(/^(?:`{3,}|~{3,})(?= *$)/));
            if (match && match[0].length >= container.fence_length) {
                // don't add closing fence to container; instead, close it:
                this.finalize(container, line_number);
            } else {
                this.addLine(ln, offset);
            }
            break;

        case 'Header':
        case 'HorizontalRule':
            // nothing to do; we already added the contents.
            break;

        default:
            if (acceptsLines(container.t)) {
                this.addLine(ln, first_nonspace);
            } else if (blank) {
                break;
            } else if (container.t !== 'HorizontalRule' &&
                       container.t !== 'Header') {
                // create paragraph container for line
                container = this.addChild('Paragraph', line_number, first_nonspace);
                this.addLine(ln, first_nonspace);
            } else {
                console.log("Line " + line_number.toString() +
                            " with container type " + container.t +
                            " did not match any condition.");

            }
        }
    }
};

// Finalize a block.  Close it and do any necessary postprocessing,
// e.g. creating string_content from strings, setting the 'tight'
// or 'loose' status of a list, and parsing the beginnings
// of paragraphs for reference definitions.  Reset the tip to the
// parent of the closed block.
var finalize = function(block, line_number) {
    var pos;
    // don't do anything if the block is already closed
    if (!block.open) {
        return 0;
    }
    block.open = false;
    if (line_number > block.start_line) {
        block.end_line = line_number - 1;
    } else {
        block.end_line = line_number;
    }

    switch (block.t) {
    case 'Paragraph':
        block.string_content = block.strings.join('\n').replace(/^ {2,}/m, '');
        // delete block.strings;

        // try parsing the beginning as link reference definitions:
        while (block.string_content.charCodeAt(0) === C_OPEN_BRACKET &&
               (pos = this.inlineParser.parseReference(block.string_content,
                                                       this.refmap))) {
            block.string_content = block.string_content.slice(pos);
            if (isBlank(block.string_content)) {
                block.t = 'ReferenceDef';
                break;
            }
        }
        break;

    case 'Header':
    case 'HtmlBlock':
        block.string_content = block.strings.join('\n');
        break;

    case 'IndentedCode':
        block.string_content = block.strings.join('\n').replace(/(\n *)*$/, '\n');
        block.t = 'CodeBlock';
        break;

    case 'FencedCode':
        // first line becomes info string
        block.info = unescapeString(block.strings[0].trim());
        if (block.strings.length === 1) {
            block.string_content = '';
        } else {
            block.string_content = block.strings.slice(1).join('\n') + '\n';
        }
        block.t = 'CodeBlock';
        break;

    case 'List':
        block.tight = true; // tight by default

        var numitems = block.children.length;
        var i = 0;
        while (i < numitems) {
            var item = block.children[i];
            // check for non-final list item ending with blank line:
            var last_item = i === numitems - 1;
            if (endsWithBlankLine(item) && !last_item) {
                block.tight = false;
                break;
            }
            // recurse into children of list item, to see if there are
            // spaces between any of them:
            var numsubitems = item.children.length;
            var j = 0;
            while (j < numsubitems) {
                var subitem = item.children[j];
                var last_subitem = j === numsubitems - 1;
                if (endsWithBlankLine(subitem) && !(last_item && last_subitem)) {
                    block.tight = false;
                    break;
                }
                j++;
            }
            i++;
        }
        break;

    default:
        break;
    }

    this.tip = block.parent || this.top;
};

// Walk through a block & children recursively, parsing string content
// into inline content where appropriate.  Returns new object.
var processInlines = function(block) {
    var newblock = {};
    newblock.t = block.t;
    newblock.start_line = block.start_line;
    newblock.start_column = block.start_column;
    newblock.end_line = block.end_line;

    switch(block.t) {
    case 'Paragraph':
        newblock.inline_content =
            this.inlineParser.parse(block.string_content.trim(), this.refmap);
        break;
    case 'Header':
        newblock.inline_content =
            this.inlineParser.parse(block.string_content.trim(), this.refmap);
        newblock.level = block.level;
        break;
    case 'List':
        newblock.list_data = block.list_data;
        newblock.tight = block.tight;
        break;
    case 'CodeBlock':
        newblock.string_content = block.string_content;
        newblock.info = block.info;
        break;
    case 'HtmlBlock':
        newblock.string_content = block.string_content;
        break;
    default:
        break;
    }

    if (block.children) {
        var newchildren = [];
        for (var i = 0; i < block.children.length; i++) {
            newchildren.push(this.processInlines(block.children[i]));
        }
        newblock.children = newchildren;
    }
    return newblock;
};

// The main parsing function.  Returns a parsed document AST.
var parse = function(input) {
    this.doc = makeBlock('Document', 1, 1);
    this.tip = this.doc;
    this.refmap = {};
    var lines = input.replace(/\n$/, '').split(/\r\n|\n|\r/);
    var len = lines.length;
    for (var i = 0; i < len; i++) {
        this.incorporateLine(lines[i], i + 1);
    }
    while (this.tip) {
        this.finalize(this.tip, len - 1);
    }
    return this.processInlines(this.doc);
};


// The DocParser object.
function DocParser(){
    return {
        doc: makeBlock('Document', 1, 1),
        tip: this.doc,
        refmap: {},
        inlineParser: new InlineParser(),
        breakOutOfLists: breakOutOfLists,
        addLine: addLine,
        addChild: addChild,
        incorporateLine: incorporateLine,
        finalize: finalize,
        processInlines: processInlines,
        parse: parse
    };
}

module.exports = DocParser;

},{"./inlines":11}],7:[function(require,module,exports){
// derived from https://github.com/mathiasbynens/String.fromCodePoint
/*! http://mths.be/fromcodepoint v0.2.1 by @mathias */
if (String.fromCodePoint) {
    module.exports = function (_) {
        "use strict";
        try {
            return String.fromCodePoint(_);
        } catch (e) {
            if (e instanceof RangeError) {
                return String.fromCharCode(0xFFFD);
            }
            throw e;
        }
    };

} else {

  var stringFromCharCode = String.fromCharCode;
  var floor = Math.floor;
  var fromCodePoint = function() {
      "use strict";
      var MAX_SIZE = 0x4000;
      var codeUnits = [];
      var highSurrogate;
      var lowSurrogate;
      var index = -1;
      var length = arguments.length;
      if (!length) {
          return '';
      }
      var result = '';
      while (++index < length) {
          var codePoint = Number(arguments[index]);
          if (
              !isFinite(codePoint) || // `NaN`, `+Infinity`, or `-Infinity`
                  codePoint < 0 || // not a valid Unicode code point
                  codePoint > 0x10FFFF || // not a valid Unicode code point
                  floor(codePoint) !== codePoint // not an integer
          ) {
              return String.fromCharCode(0xFFFD);
          }
          if (codePoint <= 0xFFFF) { // BMP code point
              codeUnits.push(codePoint);
          } else { // Astral code point; split in surrogate halves
              // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
              codePoint -= 0x10000;
              highSurrogate = (codePoint >> 10) + 0xD800;
              lowSurrogate = (codePoint % 0x400) + 0xDC00;
              codeUnits.push(highSurrogate, lowSurrogate);
          }
          if (index + 1 === length || codeUnits.length > MAX_SIZE) {
              result += stringFromCharCode.apply(null, codeUnits);
              codeUnits.length = 0;
          }
      }
      return result;
  };
  module.exports = fromCodePoint;
}

},{}],8:[function(require,module,exports){
// Helper function to produce content in a pair of HTML tags.
var inTags = function(tag, attribs, contents, selfclosing) {
    var result = '<' + tag;
    if (attribs) {
        var i = 0;
        var attrib;
        while ((attrib = attribs[i]) !== undefined) {
            result = result.concat(' ', attrib[0], '="', attrib[1], '"');
            i++;
        }
    }
    if (contents) {
        result = result.concat('>', contents, '</', tag, '>');
    } else if (selfclosing) {
        result = result + ' />';
    } else {
        result = result.concat('></', tag, '>');
    }
    return result;
};

// Render an inline element as HTML.
var renderInline = function(inline) {
    var attrs;
    switch (inline.t) {
    case 'Text':
        return this.escape(inline.c);
    case 'Softbreak':
        return this.softbreak;
    case 'Hardbreak':
        return inTags('br', [], "", true) + '\n';
    case 'Emph':
        return inTags('em', [], this.renderInlines(inline.c));
    case 'Strong':
        return inTags('strong', [], this.renderInlines(inline.c));
    case 'Html':
        return inline.c;
    case 'Link':
        attrs = [['href', this.escape(inline.destination, true)]];
        if (inline.title) {
            attrs.push(['title', this.escape(inline.title, true)]);
        }
        return inTags('a', attrs, this.renderInlines(inline.label));
    case 'Image':
        attrs = [['src', this.escape(inline.destination, true)],
                 ['alt', this.renderInlines(inline.label).
                    replace(/\<[^>]*alt="([^"]*)"[^>]*\>/g, '$1').
                    replace(/\<[^>]*\>/g, '')]];
        if (inline.title) {
            attrs.push(['title', this.escape(inline.title, true)]);
        }
        return inTags('img', attrs, "", true);
    case 'Code':
        return inTags('code', [], this.escape(inline.c));
    default:
        console.log("Unknown inline type " + inline.t);
        return "";
    }
};

// Render a list of inlines.
var renderInlines = function(inlines) {
    var result = '';
    for (var i = 0; i < inlines.length; i++) {
        result = result + this.renderInline(inlines[i]);
    }
    return result;
};

// Render a single block element.
var renderBlock = function(block, in_tight_list) {
    var tag;
    var attr;
    var info_words;
    switch (block.t) {
    case 'Document':
        var whole_doc = this.renderBlocks(block.children);
        return (whole_doc === '' ? '' : whole_doc + '\n');
    case 'Paragraph':
        if (in_tight_list) {
            return this.renderInlines(block.inline_content);
        } else {
            return inTags('p', [], this.renderInlines(block.inline_content));
        }
        break;
    case 'BlockQuote':
        var filling = this.renderBlocks(block.children);
        return inTags('blockquote', [], filling === '' ? this.innersep :
                      this.innersep + filling + this.innersep);
    case 'ListItem':
        var contents = this.renderBlocks(block.children, in_tight_list);
        if (/^[<]/.test(contents)) {
            contents = '\n' + contents;
        }
        if (/[>]$/.test(contents)) {
            contents = contents + '\n';
        }
        return inTags('li', [], contents, false).trim();
    case 'List':
        tag = block.list_data.type === 'Bullet' ? 'ul' : 'ol';
        attr = (!block.list_data.start || block.list_data.start === 1) ?
            [] : [['start', block.list_data.start.toString()]];
        return inTags(tag, attr, this.innersep +
                      this.renderBlocks(block.children, block.tight) +
                      this.innersep);
    case 'Header':
        tag = 'h' + block.level;
        return inTags(tag, [], this.renderInlines(block.inline_content));
    case 'CodeBlock':
        info_words = block.info ? block.info.split(/ +/) : [];
        attr = (info_words.length === 0 || info_words[0].length === 0) ?
            [] : [['class', 'language-' + this.escape(info_words[0], true)]];
        return inTags('pre', [],
                      inTags('code', attr, this.escape(block.string_content)));
    case 'HtmlBlock':
        return block.string_content;
    case 'ReferenceDef':
        return "";
    case 'HorizontalRule':
        return inTags('hr', [], "", true);
    default:
        console.log("Unknown block type " + block.t);
        return "";
    }
};

// Render a list of block elements, separated by this.blocksep.
var renderBlocks = function(blocks, in_tight_list) {
    var result = [];
    for (var i = 0; i < blocks.length; i++) {
        if (blocks[i].t !== 'ReferenceDef') {
            result.push(this.renderBlock(blocks[i], in_tight_list));
        }
    }
    return result.join(this.blocksep);
};

// The HtmlRenderer object.
function HtmlRenderer(){
    return {
        // default options:
        blocksep: '\n',  // space between blocks
        innersep: '\n',  // space between block container tag and contents
        softbreak: '\n', // by default, soft breaks are rendered as newlines in HTML
        // set to "<br />" to make them hard breaks
        // set to " " if you want to ignore line wrapping in source
        escape: function(s, preserve_entities) {
            if (preserve_entities) {
                return s.replace(/[&](?![#](x[a-f0-9]{1,8}|[0-9]{1,8});|[a-z][a-z0-9]{1,31};)/gi, '&amp;')
                    .replace(/[<]/g, '&lt;')
                    .replace(/[>]/g, '&gt;')
                    .replace(/["]/g, '&quot;');
            } else {
                return s.replace(/[&]/g,'&amp;')
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

module.exports = HtmlRenderer;

},{}],9:[function(require,module,exports){
var fromCodePoint = require('./from-code-point');

var entities = {
  AAacute: 193,
  aacute: 225,
  Abreve: 258,
  abreve: 259,
  ac: 8766,
  acd: 8767,
  acE: 8766,
  Acirc: 194,
  acirc: 226,
  acute: 180,
  Acy: 1040,
  acy: 1072,
  AElig: 198,
  aelig: 230,
  af: 8289,
  Afr: 55349,
  afr: 55349,
  Agrave: 192,
  agrave: 224,
  alefsym: 8501,
  aleph: 8501,
  Alpha: 913,
  alpha: 945,
  Amacr: 256,
  amacr: 257,
  amalg: 10815,
  amp: 38,
  AMP: 38,
  andand: 10837,
  And: 10835,
  and: 8743,
  andd: 10844,
  andslope: 10840,
  andv: 10842,
  ang: 8736,
  ange: 10660,
  angle: 8736,
  angmsdaa: 10664,
  angmsdab: 10665,
  angmsdac: 10666,
  angmsdad: 10667,
  angmsdae: 10668,
  angmsdaf: 10669,
  angmsdag: 10670,
  angmsdah: 10671,
  angmsd: 8737,
  angrt: 8735,
  angrtvb: 8894,
  angrtvbd: 10653,
  angsph: 8738,
  angst: 197,
  angzarr: 9084,
  Aogon: 260,
  aogon: 261,
  Aopf: 55349,
  aopf: 55349,
  apacir: 10863,
  ap: 8776,
  apE: 10864,
  ape: 8778,
  apid: 8779,
  apos: 39,
  ApplyFunction: 8289,
  approx: 8776,
  approxeq: 8778,
  Aring: 197,
  aring: 229,
  Ascr: 55349,
  ascr: 55349,
  Assign: 8788,
  ast: 42,
  asymp: 8776,
  asympeq: 8781,
  Atilde: 195,
  atilde: 227,
  Auml: 196,
  auml: 228,
  awconint: 8755,
  awint: 10769,
  backcong: 8780,
  backepsilon: 1014,
  backprime: 8245,
  backsim: 8765,
  backsimeq: 8909,
  Backslash: 8726,
  Barv: 10983,
  barvee: 8893,
  barwed: 8965,
  Barwed: 8966,
  barwedge: 8965,
  bbrk: 9141,
  bbrktbrk: 9142,
  bcong: 8780,
  Bcy: 1041,
  bcy: 1073,
  bdquo: 8222,
  becaus: 8757,
  because: 8757,
  Because: 8757,
  bemptyv: 10672,
  bepsi: 1014,
  bernou: 8492,
  Bernoullis: 8492,
  Beta: 914,
  beta: 946,
  beth: 8502,
  between: 8812,
  Bfr: 55349,
  bfr: 55349,
  bigcap: 8898,
  bigcirc: 9711,
  bigcup: 8899,
  bigodot: 10752,
  bigoplus: 10753,
  bigotimes: 10754,
  bigsqcup: 10758,
  bigstar: 9733,
  bigtriangledown: 9661,
  bigtriangleup: 9651,
  biguplus: 10756,
  bigvee: 8897,
  bigwedge: 8896,
  bkarow: 10509,
  blacklozenge: 10731,
  blacksquare: 9642,
  blacktriangle: 9652,
  blacktriangledown: 9662,
  blacktriangleleft: 9666,
  blacktriangleright: 9656,
  blank: 9251,
  blk12: 9618,
  blk14: 9617,
  blk34: 9619,
  block: 9608,
  bne: 61,
  bnequiv: 8801,
  bNot: 10989,
  bnot: 8976,
  Bopf: 55349,
  bopf: 55349,
  bot: 8869,
  bottom: 8869,
  bowtie: 8904,
  boxbox: 10697,
  boxdl: 9488,
  boxdL: 9557,
  boxDl: 9558,
  boxDL: 9559,
  boxdr: 9484,
  boxdR: 9554,
  boxDr: 9555,
  boxDR: 9556,
  boxh: 9472,
  boxH: 9552,
  boxhd: 9516,
  boxHd: 9572,
  boxhD: 9573,
  boxHD: 9574,
  boxhu: 9524,
  boxHu: 9575,
  boxhU: 9576,
  boxHU: 9577,
  boxminus: 8863,
  boxplus: 8862,
  boxtimes: 8864,
  boxul: 9496,
  boxuL: 9563,
  boxUl: 9564,
  boxUL: 9565,
  boxur: 9492,
  boxuR: 9560,
  boxUr: 9561,
  boxUR: 9562,
  boxv: 9474,
  boxV: 9553,
  boxvh: 9532,
  boxvH: 9578,
  boxVh: 9579,
  boxVH: 9580,
  boxvl: 9508,
  boxvL: 9569,
  boxVl: 9570,
  boxVL: 9571,
  boxvr: 9500,
  boxvR: 9566,
  boxVr: 9567,
  boxVR: 9568,
  bprime: 8245,
  breve: 728,
  Breve: 728,
  brvbar: 166,
  bscr: 55349,
  Bscr: 8492,
  bsemi: 8271,
  bsim: 8765,
  bsime: 8909,
  bsolb: 10693,
  bsol: 92,
  bsolhsub: 10184,
  bull: 8226,
  bullet: 8226,
  bump: 8782,
  bumpE: 10926,
  bumpe: 8783,
  Bumpeq: 8782,
  bumpeq: 8783,
  Cacute: 262,
  cacute: 263,
  capand: 10820,
  capbrcup: 10825,
  capcap: 10827,
  cap: 8745,
  Cap: 8914,
  capcup: 10823,
  capdot: 10816,
  CapitalDifferentialD: 8517,
  caps: 8745,
  caret: 8257,
  caron: 711,
  Cayleys: 8493,
  ccaps: 10829,
  Ccaron: 268,
  ccaron: 269,
  Ccedil: 199,
  ccedil: 231,
  Ccirc: 264,
  ccirc: 265,
  Cconint: 8752,
  ccups: 10828,
  ccupssm: 10832,
  Cdot: 266,
  cdot: 267,
  cedil: 184,
  Cedilla: 184,
  cemptyv: 10674,
  cent: 162,
  centerdot: 183,
  CenterDot: 183,
  cfr: 55349,
  Cfr: 8493,
  CHcy: 1063,
  chcy: 1095,
  check: 10003,
  checkmark: 10003,
  Chi: 935,
  chi: 967,
  circ: 710,
  circeq: 8791,
  circlearrowleft: 8634,
  circlearrowright: 8635,
  circledast: 8859,
  circledcirc: 8858,
  circleddash: 8861,
  CircleDot: 8857,
  circledR: 174,
  circledS: 9416,
  CircleMinus: 8854,
  CirclePlus: 8853,
  CircleTimes: 8855,
  cir: 9675,
  cirE: 10691,
  cire: 8791,
  cirfnint: 10768,
  cirmid: 10991,
  cirscir: 10690,
  ClockwiseContourIntegral: 8754,
  CloseCurlyDoubleQuote: 8221,
  CloseCurlyQuote: 8217,
  clubs: 9827,
  clubsuit: 9827,
  colon: 58,
  Colon: 8759,
  Colone: 10868,
  colone: 8788,
  coloneq: 8788,
  comma: 44,
  commat: 64,
  comp: 8705,
  compfn: 8728,
  complement: 8705,
  complexes: 8450,
  cong: 8773,
  congdot: 10861,
  Congruent: 8801,
  conint: 8750,
  Conint: 8751,
  ContourIntegral: 8750,
  copf: 55349,
  Copf: 8450,
  coprod: 8720,
  Coproduct: 8720,
  copy: 169,
  COPY: 169,
  copysr: 8471,
  CounterClockwiseContourIntegral: 8755,
  crarr: 8629,
  cross: 10007,
  Cross: 10799,
  Cscr: 55349,
  cscr: 55349,
  csub: 10959,
  csube: 10961,
  csup: 10960,
  csupe: 10962,
  ctdot: 8943,
  cudarrl: 10552,
  cudarrr: 10549,
  cuepr: 8926,
  cuesc: 8927,
  cularr: 8630,
  cularrp: 10557,
  cupbrcap: 10824,
  cupcap: 10822,
  CupCap: 8781,
  cup: 8746,
  Cup: 8915,
  cupcup: 10826,
  cupdot: 8845,
  cupor: 10821,
  cups: 8746,
  curarr: 8631,
  curarrm: 10556,
  curlyeqprec: 8926,
  curlyeqsucc: 8927,
  curlyvee: 8910,
  curlywedge: 8911,
  curren: 164,
  curvearrowleft: 8630,
  curvearrowright: 8631,
  cuvee: 8910,
  cuwed: 8911,
  cwconint: 8754,
  cwint: 8753,
  cylcty: 9005,
  dagger: 8224,
  Dagger: 8225,
  daleth: 8504,
  darr: 8595,
  Darr: 8609,
  dArr: 8659,
  dash: 8208,
  Dashv: 10980,
  dashv: 8867,
  dbkarow: 10511,
  dblac: 733,
  Dcaron: 270,
  dcaron: 271,
  Dcy: 1044,
  dcy: 1076,
  ddagger: 8225,
  ddarr: 8650,
  DD: 8517,
  dd: 8518,
  DDotrahd: 10513,
  ddotseq: 10871,
  deg: 176,
  Del: 8711,
  Delta: 916,
  delta: 948,
  demptyv: 10673,
  dfisht: 10623,
  Dfr: 55349,
  dfr: 55349,
  dHar: 10597,
  dharl: 8643,
  dharr: 8642,
  DiacriticalAcute: 180,
  DiacriticalDot: 729,
  DiacriticalDoubleAcute: 733,
  DiacriticalGrave: 96,
  DiacriticalTilde: 732,
  diam: 8900,
  diamond: 8900,
  Diamond: 8900,
  diamondsuit: 9830,
  diams: 9830,
  die: 168,
  DifferentialD: 8518,
  digamma: 989,
  disin: 8946,
  div: 247,
  divide: 247,
  divideontimes: 8903,
  divonx: 8903,
  DJcy: 1026,
  djcy: 1106,
  dlcorn: 8990,
  dlcrop: 8973,
  dollar: 36,
  Dopf: 55349,
  dopf: 55349,
  Dot: 168,
  dot: 729,
  DotDot: 8412,
  doteq: 8784,
  doteqdot: 8785,
  DotEqual: 8784,
  dotminus: 8760,
  dotplus: 8724,
  dotsquare: 8865,
  doublebarwedge: 8966,
  DoubleContourIntegral: 8751,
  DoubleDot: 168,
  DoubleDownArrow: 8659,
  DoubleLeftArrow: 8656,
  DoubleLeftRightArrow: 8660,
  DoubleLeftTee: 10980,
  DoubleLongLeftArrow: 10232,
  DoubleLongLeftRightArrow: 10234,
  DoubleLongRightArrow: 10233,
  DoubleRightArrow: 8658,
  DoubleRightTee: 8872,
  DoubleUpArrow: 8657,
  DoubleUpDownArrow: 8661,
  DoubleVerticalBar: 8741,
  DownArrowBar: 10515,
  downarrow: 8595,
  DownArrow: 8595,
  Downarrow: 8659,
  DownArrowUpArrow: 8693,
  DownBreve: 785,
  downdownarrows: 8650,
  downharpoonleft: 8643,
  downharpoonright: 8642,
  DownLeftRightVector: 10576,
  DownLeftTeeVector: 10590,
  DownLeftVectorBar: 10582,
  DownLeftVector: 8637,
  DownRightTeeVector: 10591,
  DownRightVectorBar: 10583,
  DownRightVector: 8641,
  DownTeeArrow: 8615,
  DownTee: 8868,
  drbkarow: 10512,
  drcorn: 8991,
  drcrop: 8972,
  Dscr: 55349,
  dscr: 55349,
  DScy: 1029,
  dscy: 1109,
  dsol: 10742,
  Dstrok: 272,
  dstrok: 273,
  dtdot: 8945,
  dtri: 9663,
  dtrif: 9662,
  duarr: 8693,
  duhar: 10607,
  dwangle: 10662,
  DZcy: 1039,
  dzcy: 1119,
  dzigrarr: 10239,
  Eacute: 201,
  eacute: 233,
  easter: 10862,
  Ecaron: 282,
  ecaron: 283,
  Ecirc: 202,
  ecirc: 234,
  ecir: 8790,
  ecolon: 8789,
  Ecy: 1069,
  ecy: 1101,
  eDDot: 10871,
  Edot: 278,
  edot: 279,
  eDot: 8785,
  ee: 8519,
  efDot: 8786,
  Efr: 55349,
  efr: 55349,
  eg: 10906,
  Egrave: 200,
  egrave: 232,
  egs: 10902,
  egsdot: 10904,
  el: 10905,
  Element: 8712,
  elinters: 9191,
  ell: 8467,
  els: 10901,
  elsdot: 10903,
  Emacr: 274,
  emacr: 275,
  empty: 8709,
  emptyset: 8709,
  EmptySmallSquare: 9723,
  emptyv: 8709,
  EmptyVerySmallSquare: 9643,
  emsp13: 8196,
  emsp14: 8197,
  emsp: 8195,
  ENG: 330,
  eng: 331,
  ensp: 8194,
  Eogon: 280,
  eogon: 281,
  Eopf: 55349,
  eopf: 55349,
  epar: 8917,
  eparsl: 10723,
  eplus: 10865,
  epsi: 949,
  Epsilon: 917,
  epsilon: 949,
  epsiv: 1013,
  eqcirc: 8790,
  eqcolon: 8789,
  eqsim: 8770,
  eqslantgtr: 10902,
  eqslantless: 10901,
  Equal: 10869,
  equals: 61,
  EqualTilde: 8770,
  equest: 8799,
  Equilibrium: 8652,
  equiv: 8801,
  equivDD: 10872,
  eqvparsl: 10725,
  erarr: 10609,
  erDot: 8787,
  escr: 8495,
  Escr: 8496,
  esdot: 8784,
  Esim: 10867,
  esim: 8770,
  Eta: 919,
  eta: 951,
  ETH: 208,
  eth: 240,
  Euml: 203,
  euml: 235,
  euro: 8364,
  excl: 33,
  exist: 8707,
  Exists: 8707,
  expectation: 8496,
  exponentiale: 8519,
  ExponentialE: 8519,
  fallingdotseq: 8786,
  Fcy: 1060,
  fcy: 1092,
  female: 9792,
  ffilig: 64259,
  fflig: 64256,
  ffllig: 64260,
  Ffr: 55349,
  ffr: 55349,
  filig: 64257,
  FilledSmallSquare: 9724,
  FilledVerySmallSquare: 9642,
  fjlig: 102,
  flat: 9837,
  fllig: 64258,
  fltns: 9649,
  fnof: 402,
  Fopf: 55349,
  fopf: 55349,
  forall: 8704,
  ForAll: 8704,
  fork: 8916,
  forkv: 10969,
  Fouriertrf: 8497,
  fpartint: 10765,
  frac12: 189,
  frac13: 8531,
  frac14: 188,
  frac15: 8533,
  frac16: 8537,
  frac18: 8539,
  frac23: 8532,
  frac25: 8534,
  frac34: 190,
  frac35: 8535,
  frac38: 8540,
  frac45: 8536,
  frac56: 8538,
  frac58: 8541,
  frac78: 8542,
  frasl: 8260,
  frown: 8994,
  fscr: 55349,
  Fscr: 8497,
  gacute: 501,
  Gamma: 915,
  gamma: 947,
  Gammad: 988,
  gammad: 989,
  gap: 10886,
  Gbreve: 286,
  gbreve: 287,
  Gcedil: 290,
  Gcirc: 284,
  gcirc: 285,
  Gcy: 1043,
  gcy: 1075,
  Gdot: 288,
  gdot: 289,
  ge: 8805,
  gE: 8807,
  gEl: 10892,
  gel: 8923,
  geq: 8805,
  geqq: 8807,
  geqslant: 10878,
  gescc: 10921,
  ges: 10878,
  gesdot: 10880,
  gesdoto: 10882,
  gesdotol: 10884,
  gesl: 8923,
  gesles: 10900,
  Gfr: 55349,
  gfr: 55349,
  gg: 8811,
  Gg: 8921,
  ggg: 8921,
  gimel: 8503,
  GJcy: 1027,
  gjcy: 1107,
  gla: 10917,
  gl: 8823,
  glE: 10898,
  glj: 10916,
  gnap: 10890,
  gnapprox: 10890,
  gne: 10888,
  gnE: 8809,
  gneq: 10888,
  gneqq: 8809,
  gnsim: 8935,
  Gopf: 55349,
  gopf: 55349,
  grave: 96,
  GreaterEqual: 8805,
  GreaterEqualLess: 8923,
  GreaterFullEqual: 8807,
  GreaterGreater: 10914,
  GreaterLess: 8823,
  GreaterSlantEqual: 10878,
  GreaterTilde: 8819,
  Gscr: 55349,
  gscr: 8458,
  gsim: 8819,
  gsime: 10894,
  gsiml: 10896,
  gtcc: 10919,
  gtcir: 10874,
  gt: 62,
  GT: 62,
  Gt: 8811,
  gtdot: 8919,
  gtlPar: 10645,
  gtquest: 10876,
  gtrapprox: 10886,
  gtrarr: 10616,
  gtrdot: 8919,
  gtreqless: 8923,
  gtreqqless: 10892,
  gtrless: 8823,
  gtrsim: 8819,
  gvertneqq: 8809,
  gvnE: 8809,
  Hacek: 711,
  hairsp: 8202,
  half: 189,
  hamilt: 8459,
  HARDcy: 1066,
  hardcy: 1098,
  harrcir: 10568,
  harr: 8596,
  hArr: 8660,
  harrw: 8621,
  Hat: 94,
  hbar: 8463,
  Hcirc: 292,
  hcirc: 293,
  hearts: 9829,
  heartsuit: 9829,
  hellip: 8230,
  hercon: 8889,
  hfr: 55349,
  Hfr: 8460,
  HilbertSpace: 8459,
  hksearow: 10533,
  hkswarow: 10534,
  hoarr: 8703,
  homtht: 8763,
  hookleftarrow: 8617,
  hookrightarrow: 8618,
  hopf: 55349,
  Hopf: 8461,
  horbar: 8213,
  HorizontalLine: 9472,
  hscr: 55349,
  Hscr: 8459,
  hslash: 8463,
  Hstrok: 294,
  hstrok: 295,
  HumpDownHump: 8782,
  HumpEqual: 8783,
  hybull: 8259,
  hyphen: 8208,
  Iacute: 205,
  iacute: 237,
  ic: 8291,
  Icirc: 206,
  icirc: 238,
  Icy: 1048,
  icy: 1080,
  Idot: 304,
  IEcy: 1045,
  iecy: 1077,
  iexcl: 161,
  iff: 8660,
  ifr: 55349,
  Ifr: 8465,
  Igrave: 204,
  igrave: 236,
  ii: 8520,
  iiiint: 10764,
  iiint: 8749,
  iinfin: 10716,
  iiota: 8489,
  IJlig: 306,
  ijlig: 307,
  Imacr: 298,
  imacr: 299,
  image: 8465,
  ImaginaryI: 8520,
  imagline: 8464,
  imagpart: 8465,
  imath: 305,
  Im: 8465,
  imof: 8887,
  imped: 437,
  Implies: 8658,
  incare: 8453,
  'in': 8712,
  infin: 8734,
  infintie: 10717,
  inodot: 305,
  intcal: 8890,
  int: 8747,
  Int: 8748,
  integers: 8484,
  Integral: 8747,
  intercal: 8890,
  Intersection: 8898,
  intlarhk: 10775,
  intprod: 10812,
  InvisibleComma: 8291,
  InvisibleTimes: 8290,
  IOcy: 1025,
  iocy: 1105,
  Iogon: 302,
  iogon: 303,
  Iopf: 55349,
  iopf: 55349,
  Iota: 921,
  iota: 953,
  iprod: 10812,
  iquest: 191,
  iscr: 55349,
  Iscr: 8464,
  isin: 8712,
  isindot: 8949,
  isinE: 8953,
  isins: 8948,
  isinsv: 8947,
  isinv: 8712,
  it: 8290,
  Itilde: 296,
  itilde: 297,
  Iukcy: 1030,
  iukcy: 1110,
  Iuml: 207,
  iuml: 239,
  Jcirc: 308,
  jcirc: 309,
  Jcy: 1049,
  jcy: 1081,
  Jfr: 55349,
  jfr: 55349,
  jmath: 567,
  Jopf: 55349,
  jopf: 55349,
  Jscr: 55349,
  jscr: 55349,
  Jsercy: 1032,
  jsercy: 1112,
  Jukcy: 1028,
  jukcy: 1108,
  Kappa: 922,
  kappa: 954,
  kappav: 1008,
  Kcedil: 310,
  kcedil: 311,
  Kcy: 1050,
  kcy: 1082,
  Kfr: 55349,
  kfr: 55349,
  kgreen: 312,
  KHcy: 1061,
  khcy: 1093,
  KJcy: 1036,
  kjcy: 1116,
  Kopf: 55349,
  kopf: 55349,
  Kscr: 55349,
  kscr: 55349,
  lAarr: 8666,
  Lacute: 313,
  lacute: 314,
  laemptyv: 10676,
  lagran: 8466,
  Lambda: 923,
  lambda: 955,
  lang: 10216,
  Lang: 10218,
  langd: 10641,
  langle: 10216,
  lap: 10885,
  Laplacetrf: 8466,
  laquo: 171,
  larrb: 8676,
  larrbfs: 10527,
  larr: 8592,
  Larr: 8606,
  lArr: 8656,
  larrfs: 10525,
  larrhk: 8617,
  larrlp: 8619,
  larrpl: 10553,
  larrsim: 10611,
  larrtl: 8610,
  latail: 10521,
  lAtail: 10523,
  lat: 10923,
  late: 10925,
  lates: 10925,
  lbarr: 10508,
  lBarr: 10510,
  lbbrk: 10098,
  lbrace: 123,
  lbrack: 91,
  lbrke: 10635,
  lbrksld: 10639,
  lbrkslu: 10637,
  Lcaron: 317,
  lcaron: 318,
  Lcedil: 315,
  lcedil: 316,
  lceil: 8968,
  lcub: 123,
  Lcy: 1051,
  lcy: 1083,
  ldca: 10550,
  ldquo: 8220,
  ldquor: 8222,
  ldrdhar: 10599,
  ldrushar: 10571,
  ldsh: 8626,
  le: 8804,
  lE: 8806,
  LeftAngleBracket: 10216,
  LeftArrowBar: 8676,
  leftarrow: 8592,
  LeftArrow: 8592,
  Leftarrow: 8656,
  LeftArrowRightArrow: 8646,
  leftarrowtail: 8610,
  LeftCeiling: 8968,
  LeftDoubleBracket: 10214,
  LeftDownTeeVector: 10593,
  LeftDownVectorBar: 10585,
  LeftDownVector: 8643,
  LeftFloor: 8970,
  leftharpoondown: 8637,
  leftharpoonup: 8636,
  leftleftarrows: 8647,
  leftrightarrow: 8596,
  LeftRightArrow: 8596,
  Leftrightarrow: 8660,
  leftrightarrows: 8646,
  leftrightharpoons: 8651,
  leftrightsquigarrow: 8621,
  LeftRightVector: 10574,
  LeftTeeArrow: 8612,
  LeftTee: 8867,
  LeftTeeVector: 10586,
  leftthreetimes: 8907,
  LeftTriangleBar: 10703,
  LeftTriangle: 8882,
  LeftTriangleEqual: 8884,
  LeftUpDownVector: 10577,
  LeftUpTeeVector: 10592,
  LeftUpVectorBar: 10584,
  LeftUpVector: 8639,
  LeftVectorBar: 10578,
  LeftVector: 8636,
  lEg: 10891,
  leg: 8922,
  leq: 8804,
  leqq: 8806,
  leqslant: 10877,
  lescc: 10920,
  les: 10877,
  lesdot: 10879,
  lesdoto: 10881,
  lesdotor: 10883,
  lesg: 8922,
  lesges: 10899,
  lessapprox: 10885,
  lessdot: 8918,
  lesseqgtr: 8922,
  lesseqqgtr: 10891,
  LessEqualGreater: 8922,
  LessFullEqual: 8806,
  LessGreater: 8822,
  lessgtr: 8822,
  LessLess: 10913,
  lesssim: 8818,
  LessSlantEqual: 10877,
  LessTilde: 8818,
  lfisht: 10620,
  lfloor: 8970,
  Lfr: 55349,
  lfr: 55349,
  lg: 8822,
  lgE: 10897,
  lHar: 10594,
  lhard: 8637,
  lharu: 8636,
  lharul: 10602,
  lhblk: 9604,
  LJcy: 1033,
  ljcy: 1113,
  llarr: 8647,
  ll: 8810,
  Ll: 8920,
  llcorner: 8990,
  Lleftarrow: 8666,
  llhard: 10603,
  lltri: 9722,
  Lmidot: 319,
  lmidot: 320,
  lmoustache: 9136,
  lmoust: 9136,
  lnap: 10889,
  lnapprox: 10889,
  lne: 10887,
  lnE: 8808,
  lneq: 10887,
  lneqq: 8808,
  lnsim: 8934,
  loang: 10220,
  loarr: 8701,
  lobrk: 10214,
  longleftarrow: 10229,
  LongLeftArrow: 10229,
  Longleftarrow: 10232,
  longleftrightarrow: 10231,
  LongLeftRightArrow: 10231,
  Longleftrightarrow: 10234,
  longmapsto: 10236,
  longrightarrow: 10230,
  LongRightArrow: 10230,
  Longrightarrow: 10233,
  looparrowleft: 8619,
  looparrowright: 8620,
  lopar: 10629,
  Lopf: 55349,
  lopf: 55349,
  loplus: 10797,
  lotimes: 10804,
  lowast: 8727,
  lowbar: 95,
  LowerLeftArrow: 8601,
  LowerRightArrow: 8600,
  loz: 9674,
  lozenge: 9674,
  lozf: 10731,
  lpar: 40,
  lparlt: 10643,
  lrarr: 8646,
  lrcorner: 8991,
  lrhar: 8651,
  lrhard: 10605,
  lrm: 8206,
  lrtri: 8895,
  lsaquo: 8249,
  lscr: 55349,
  Lscr: 8466,
  lsh: 8624,
  Lsh: 8624,
  lsim: 8818,
  lsime: 10893,
  lsimg: 10895,
  lsqb: 91,
  lsquo: 8216,
  lsquor: 8218,
  Lstrok: 321,
  lstrok: 322,
  ltcc: 10918,
  ltcir: 10873,
  lt: 60,
  LT: 60,
  Lt: 8810,
  ltdot: 8918,
  lthree: 8907,
  ltimes: 8905,
  ltlarr: 10614,
  ltquest: 10875,
  ltri: 9667,
  ltrie: 8884,
  ltrif: 9666,
  ltrPar: 10646,
  lurdshar: 10570,
  luruhar: 10598,
  lvertneqq: 8808,
  lvnE: 8808,
  macr: 175,
  male: 9794,
  malt: 10016,
  maltese: 10016,
  Map: 10501,
  map: 8614,
  mapsto: 8614,
  mapstodown: 8615,
  mapstoleft: 8612,
  mapstoup: 8613,
  marker: 9646,
  mcomma: 10793,
  Mcy: 1052,
  mcy: 1084,
  mdash: 8212,
  mDDot: 8762,
  measuredangle: 8737,
  MediumSpace: 8287,
  Mellintrf: 8499,
  Mfr: 55349,
  mfr: 55349,
  mho: 8487,
  micro: 181,
  midast: 42,
  midcir: 10992,
  mid: 8739,
  middot: 183,
  minusb: 8863,
  minus: 8722,
  minusd: 8760,
  minusdu: 10794,
  MinusPlus: 8723,
  mlcp: 10971,
  mldr: 8230,
  mnplus: 8723,
  models: 8871,
  Mopf: 55349,
  mopf: 55349,
  mp: 8723,
  mscr: 55349,
  Mscr: 8499,
  mstpos: 8766,
  Mu: 924,
  mu: 956,
  multimap: 8888,
  mumap: 8888,
  nabla: 8711,
  Nacute: 323,
  nacute: 324,
  nang: 8736,
  nap: 8777,
  napE: 10864,
  napid: 8779,
  napos: 329,
  napprox: 8777,
  natural: 9838,
  naturals: 8469,
  natur: 9838,
  nbsp: 160,
  nbump: 8782,
  nbumpe: 8783,
  ncap: 10819,
  Ncaron: 327,
  ncaron: 328,
  Ncedil: 325,
  ncedil: 326,
  ncong: 8775,
  ncongdot: 10861,
  ncup: 10818,
  Ncy: 1053,
  ncy: 1085,
  ndash: 8211,
  nearhk: 10532,
  nearr: 8599,
  neArr: 8663,
  nearrow: 8599,
  ne: 8800,
  nedot: 8784,
  NegativeMediumSpace: 8203,
  NegativeThickSpace: 8203,
  NegativeThinSpace: 8203,
  NegativeVeryThinSpace: 8203,
  nequiv: 8802,
  nesear: 10536,
  nesim: 8770,
  NestedGreaterGreater: 8811,
  NestedLessLess: 8810,
  NewLine: 10,
  nexist: 8708,
  nexists: 8708,
  Nfr: 55349,
  nfr: 55349,
  ngE: 8807,
  nge: 8817,
  ngeq: 8817,
  ngeqq: 8807,
  ngeqslant: 10878,
  nges: 10878,
  nGg: 8921,
  ngsim: 8821,
  nGt: 8811,
  ngt: 8815,
  ngtr: 8815,
  nGtv: 8811,
  nharr: 8622,
  nhArr: 8654,
  nhpar: 10994,
  ni: 8715,
  nis: 8956,
  nisd: 8954,
  niv: 8715,
  NJcy: 1034,
  njcy: 1114,
  nlarr: 8602,
  nlArr: 8653,
  nldr: 8229,
  nlE: 8806,
  nle: 8816,
  nleftarrow: 8602,
  nLeftarrow: 8653,
  nleftrightarrow: 8622,
  nLeftrightarrow: 8654,
  nleq: 8816,
  nleqq: 8806,
  nleqslant: 10877,
  nles: 10877,
  nless: 8814,
  nLl: 8920,
  nlsim: 8820,
  nLt: 8810,
  nlt: 8814,
  nltri: 8938,
  nltrie: 8940,
  nLtv: 8810,
  nmid: 8740,
  NoBreak: 8288,
  NonBreakingSpace: 160,
  nopf: 55349,
  Nopf: 8469,
  Not: 10988,
  not: 172,
  NotCongruent: 8802,
  NotCupCap: 8813,
  NotDoubleVerticalBar: 8742,
  NotElement: 8713,
  NotEqual: 8800,
  NotEqualTilde: 8770,
  NotExists: 8708,
  NotGreater: 8815,
  NotGreaterEqual: 8817,
  NotGreaterFullEqual: 8807,
  NotGreaterGreater: 8811,
  NotGreaterLess: 8825,
  NotGreaterSlantEqual: 10878,
  NotGreaterTilde: 8821,
  NotHumpDownHump: 8782,
  NotHumpEqual: 8783,
  notin: 8713,
  notindot: 8949,
  notinE: 8953,
  notinva: 8713,
  notinvb: 8951,
  notinvc: 8950,
  NotLeftTriangleBar: 10703,
  NotLeftTriangle: 8938,
  NotLeftTriangleEqual: 8940,
  NotLess: 8814,
  NotLessEqual: 8816,
  NotLessGreater: 8824,
  NotLessLess: 8810,
  NotLessSlantEqual: 10877,
  NotLessTilde: 8820,
  NotNestedGreaterGreater: 10914,
  NotNestedLessLess: 10913,
  notni: 8716,
  notniva: 8716,
  notnivb: 8958,
  notnivc: 8957,
  NotPrecedes: 8832,
  NotPrecedesEqual: 10927,
  NotPrecedesSlantEqual: 8928,
  NotReverseElement: 8716,
  NotRightTriangleBar: 10704,
  NotRightTriangle: 8939,
  NotRightTriangleEqual: 8941,
  NotSquareSubset: 8847,
  NotSquareSubsetEqual: 8930,
  NotSquareSuperset: 8848,
  NotSquareSupersetEqual: 8931,
  NotSubset: 8834,
  NotSubsetEqual: 8840,
  NotSucceeds: 8833,
  NotSucceedsEqual: 10928,
  NotSucceedsSlantEqual: 8929,
  NotSucceedsTilde: 8831,
  NotSuperset: 8835,
  NotSupersetEqual: 8841,
  NotTilde: 8769,
  NotTildeEqual: 8772,
  NotTildeFullEqual: 8775,
  NotTildeTilde: 8777,
  NotVerticalBar: 8740,
  nparallel: 8742,
  npar: 8742,
  nparsl: 11005,
  npart: 8706,
  npolint: 10772,
  npr: 8832,
  nprcue: 8928,
  nprec: 8832,
  npreceq: 10927,
  npre: 10927,
  nrarrc: 10547,
  nrarr: 8603,
  nrArr: 8655,
  nrarrw: 8605,
  nrightarrow: 8603,
  nRightarrow: 8655,
  nrtri: 8939,
  nrtrie: 8941,
  nsc: 8833,
  nsccue: 8929,
  nsce: 10928,
  Nscr: 55349,
  nscr: 55349,
  nshortmid: 8740,
  nshortparallel: 8742,
  nsim: 8769,
  nsime: 8772,
  nsimeq: 8772,
  nsmid: 8740,
  nspar: 8742,
  nsqsube: 8930,
  nsqsupe: 8931,
  nsub: 8836,
  nsubE: 10949,
  nsube: 8840,
  nsubset: 8834,
  nsubseteq: 8840,
  nsubseteqq: 10949,
  nsucc: 8833,
  nsucceq: 10928,
  nsup: 8837,
  nsupE: 10950,
  nsupe: 8841,
  nsupset: 8835,
  nsupseteq: 8841,
  nsupseteqq: 10950,
  ntgl: 8825,
  Ntilde: 209,
  ntilde: 241,
  ntlg: 8824,
  ntriangleleft: 8938,
  ntrianglelefteq: 8940,
  ntriangleright: 8939,
  ntrianglerighteq: 8941,
  Nu: 925,
  nu: 957,
  num: 35,
  numero: 8470,
  numsp: 8199,
  nvap: 8781,
  nvdash: 8876,
  nvDash: 8877,
  nVdash: 8878,
  nVDash: 8879,
  nvge: 8805,
  nvgt: 62,
  nvHarr: 10500,
  nvinfin: 10718,
  nvlArr: 10498,
  nvle: 8804,
  nvlt: 62,
  nvltrie: 8884,
  nvrArr: 10499,
  nvrtrie: 8885,
  nvsim: 8764,
  nwarhk: 10531,
  nwarr: 8598,
  nwArr: 8662,
  nwarrow: 8598,
  nwnear: 10535,
  Oacute: 211,
  oacute: 243,
  oast: 8859,
  Ocirc: 212,
  ocirc: 244,
  ocir: 8858,
  Ocy: 1054,
  ocy: 1086,
  odash: 8861,
  Odblac: 336,
  odblac: 337,
  odiv: 10808,
  odot: 8857,
  odsold: 10684,
  OElig: 338,
  oelig: 339,
  ofcir: 10687,
  Ofr: 55349,
  ofr: 55349,
  ogon: 731,
  Ograve: 210,
  ograve: 242,
  ogt: 10689,
  ohbar: 10677,
  ohm: 937,
  oint: 8750,
  olarr: 8634,
  olcir: 10686,
  olcross: 10683,
  oline: 8254,
  olt: 10688,
  Omacr: 332,
  omacr: 333,
  Omega: 937,
  omega: 969,
  Omicron: 927,
  omicron: 959,
  omid: 10678,
  ominus: 8854,
  Oopf: 55349,
  oopf: 55349,
  opar: 10679,
  OpenCurlyDoubleQuote: 8220,
  OpenCurlyQuote: 8216,
  operp: 10681,
  oplus: 8853,
  orarr: 8635,
  Or: 10836,
  or: 8744,
  ord: 10845,
  order: 8500,
  orderof: 8500,
  ordf: 170,
  ordm: 186,
  origof: 8886,
  oror: 10838,
  orslope: 10839,
  orv: 10843,
  oS: 9416,
  Oscr: 55349,
  oscr: 8500,
  Oslash: 216,
  oslash: 248,
  osol: 8856,
  Otilde: 213,
  otilde: 245,
  otimesas: 10806,
  Otimes: 10807,
  otimes: 8855,
  Ouml: 214,
  ouml: 246,
  ovbar: 9021,
  OverBar: 8254,
  OverBrace: 9182,
  OverBracket: 9140,
  OverParenthesis: 9180,
  para: 182,
  parallel: 8741,
  par: 8741,
  parsim: 10995,
  parsl: 11005,
  part: 8706,
  PartialD: 8706,
  Pcy: 1055,
  pcy: 1087,
  percnt: 37,
  period: 46,
  permil: 8240,
  perp: 8869,
  pertenk: 8241,
  Pfr: 55349,
  pfr: 55349,
  Phi: 934,
  phi: 966,
  phiv: 981,
  phmmat: 8499,
  phone: 9742,
  Pi: 928,
  pi: 960,
  pitchfork: 8916,
  piv: 982,
  planck: 8463,
  planckh: 8462,
  plankv: 8463,
  plusacir: 10787,
  plusb: 8862,
  pluscir: 10786,
  plus: 43,
  plusdo: 8724,
  plusdu: 10789,
  pluse: 10866,
  PlusMinus: 177,
  plusmn: 177,
  plussim: 10790,
  plustwo: 10791,
  pm: 177,
  Poincareplane: 8460,
  pointint: 10773,
  popf: 55349,
  Popf: 8473,
  pound: 163,
  prap: 10935,
  Pr: 10939,
  pr: 8826,
  prcue: 8828,
  precapprox: 10935,
  prec: 8826,
  preccurlyeq: 8828,
  Precedes: 8826,
  PrecedesEqual: 10927,
  PrecedesSlantEqual: 8828,
  PrecedesTilde: 8830,
  preceq: 10927,
  precnapprox: 10937,
  precneqq: 10933,
  precnsim: 8936,
  pre: 10927,
  prE: 10931,
  precsim: 8830,
  prime: 8242,
  Prime: 8243,
  primes: 8473,
  prnap: 10937,
  prnE: 10933,
  prnsim: 8936,
  prod: 8719,
  Product: 8719,
  profalar: 9006,
  profline: 8978,
  profsurf: 8979,
  prop: 8733,
  Proportional: 8733,
  Proportion: 8759,
  propto: 8733,
  prsim: 8830,
  prurel: 8880,
  Pscr: 55349,
  pscr: 55349,
  Psi: 936,
  psi: 968,
  puncsp: 8200,
  Qfr: 55349,
  qfr: 55349,
  qint: 10764,
  qopf: 55349,
  Qopf: 8474,
  qprime: 8279,
  Qscr: 55349,
  qscr: 55349,
  quaternions: 8461,
  quatint: 10774,
  quest: 63,
  questeq: 8799,
  quot: 34,
  QUOT: 34,
  rAarr: 8667,
  race: 8765,
  Racute: 340,
  racute: 341,
  radic: 8730,
  raemptyv: 10675,
  rang: 10217,
  Rang: 10219,
  rangd: 10642,
  range: 10661,
  rangle: 10217,
  raquo: 187,
  rarrap: 10613,
  rarrb: 8677,
  rarrbfs: 10528,
  rarrc: 10547,
  rarr: 8594,
  Rarr: 8608,
  rArr: 8658,
  rarrfs: 10526,
  rarrhk: 8618,
  rarrlp: 8620,
  rarrpl: 10565,
  rarrsim: 10612,
  Rarrtl: 10518,
  rarrtl: 8611,
  rarrw: 8605,
  ratail: 10522,
  rAtail: 10524,
  ratio: 8758,
  rationals: 8474,
  rbarr: 10509,
  rBarr: 10511,
  RBarr: 10512,
  rbbrk: 10099,
  rbrace: 125,
  rbrack: 93,
  rbrke: 10636,
  rbrksld: 10638,
  rbrkslu: 10640,
  Rcaron: 344,
  rcaron: 345,
  Rcedil: 342,
  rcedil: 343,
  rceil: 8969,
  rcub: 125,
  Rcy: 1056,
  rcy: 1088,
  rdca: 10551,
  rdldhar: 10601,
  rdquo: 8221,
  rdquor: 8221,
  rdsh: 8627,
  real: 8476,
  realine: 8475,
  realpart: 8476,
  reals: 8477,
  Re: 8476,
  rect: 9645,
  reg: 174,
  REG: 174,
  ReverseElement: 8715,
  ReverseEquilibrium: 8651,
  ReverseUpEquilibrium: 10607,
  rfisht: 10621,
  rfloor: 8971,
  rfr: 55349,
  Rfr: 8476,
  rHar: 10596,
  rhard: 8641,
  rharu: 8640,
  rharul: 10604,
  Rho: 929,
  rho: 961,
  rhov: 1009,
  RightAngleBracket: 10217,
  RightArrowBar: 8677,
  rightarrow: 8594,
  RightArrow: 8594,
  Rightarrow: 8658,
  RightArrowLeftArrow: 8644,
  rightarrowtail: 8611,
  RightCeiling: 8969,
  RightDoubleBracket: 10215,
  RightDownTeeVector: 10589,
  RightDownVectorBar: 10581,
  RightDownVector: 8642,
  RightFloor: 8971,
  rightharpoondown: 8641,
  rightharpoonup: 8640,
  rightleftarrows: 8644,
  rightleftharpoons: 8652,
  rightrightarrows: 8649,
  rightsquigarrow: 8605,
  RightTeeArrow: 8614,
  RightTee: 8866,
  RightTeeVector: 10587,
  rightthreetimes: 8908,
  RightTriangleBar: 10704,
  RightTriangle: 8883,
  RightTriangleEqual: 8885,
  RightUpDownVector: 10575,
  RightUpTeeVector: 10588,
  RightUpVectorBar: 10580,
  RightUpVector: 8638,
  RightVectorBar: 10579,
  RightVector: 8640,
  ring: 730,
  risingdotseq: 8787,
  rlarr: 8644,
  rlhar: 8652,
  rlm: 8207,
  rmoustache: 9137,
  rmoust: 9137,
  rnmid: 10990,
  roang: 10221,
  roarr: 8702,
  robrk: 10215,
  ropar: 10630,
  ropf: 55349,
  Ropf: 8477,
  roplus: 10798,
  rotimes: 10805,
  RoundImplies: 10608,
  rpar: 41,
  rpargt: 10644,
  rppolint: 10770,
  rrarr: 8649,
  Rrightarrow: 8667,
  rsaquo: 8250,
  rscr: 55349,
  Rscr: 8475,
  rsh: 8625,
  Rsh: 8625,
  rsqb: 93,
  rsquo: 8217,
  rsquor: 8217,
  rthree: 8908,
  rtimes: 8906,
  rtri: 9657,
  rtrie: 8885,
  rtrif: 9656,
  rtriltri: 10702,
  RuleDelayed: 10740,
  ruluhar: 10600,
  rx: 8478,
  Sacute: 346,
  sacute: 347,
  sbquo: 8218,
  scap: 10936,
  Scaron: 352,
  scaron: 353,
  Sc: 10940,
  sc: 8827,
  sccue: 8829,
  sce: 10928,
  scE: 10932,
  Scedil: 350,
  scedil: 351,
  Scirc: 348,
  scirc: 349,
  scnap: 10938,
  scnE: 10934,
  scnsim: 8937,
  scpolint: 10771,
  scsim: 8831,
  Scy: 1057,
  scy: 1089,
  sdotb: 8865,
  sdot: 8901,
  sdote: 10854,
  searhk: 10533,
  searr: 8600,
  seArr: 8664,
  searrow: 8600,
  sect: 167,
  semi: 59,
  seswar: 10537,
  setminus: 8726,
  setmn: 8726,
  sext: 10038,
  Sfr: 55349,
  sfr: 55349,
  sfrown: 8994,
  sharp: 9839,
  SHCHcy: 1065,
  shchcy: 1097,
  SHcy: 1064,
  shcy: 1096,
  ShortDownArrow: 8595,
  ShortLeftArrow: 8592,
  shortmid: 8739,
  shortparallel: 8741,
  ShortRightArrow: 8594,
  ShortUpArrow: 8593,
  shy: 173,
  Sigma: 931,
  sigma: 963,
  sigmaf: 962,
  sigmav: 962,
  sim: 8764,
  simdot: 10858,
  sime: 8771,
  simeq: 8771,
  simg: 10910,
  simgE: 10912,
  siml: 10909,
  simlE: 10911,
  simne: 8774,
  simplus: 10788,
  simrarr: 10610,
  slarr: 8592,
  SmallCircle: 8728,
  smallsetminus: 8726,
  smashp: 10803,
  smeparsl: 10724,
  smid: 8739,
  smile: 8995,
  smt: 10922,
  smte: 10924,
  smtes: 10924,
  SOFTcy: 1068,
  softcy: 1100,
  solbar: 9023,
  solb: 10692,
  sol: 47,
  Sopf: 55349,
  sopf: 55349,
  spades: 9824,
  spadesuit: 9824,
  spar: 8741,
  sqcap: 8851,
  sqcaps: 8851,
  sqcup: 8852,
  sqcups: 8852,
  Sqrt: 8730,
  sqsub: 8847,
  sqsube: 8849,
  sqsubset: 8847,
  sqsubseteq: 8849,
  sqsup: 8848,
  sqsupe: 8850,
  sqsupset: 8848,
  sqsupseteq: 8850,
  square: 9633,
  Square: 9633,
  SquareIntersection: 8851,
  SquareSubset: 8847,
  SquareSubsetEqual: 8849,
  SquareSuperset: 8848,
  SquareSupersetEqual: 8850,
  SquareUnion: 8852,
  squarf: 9642,
  squ: 9633,
  squf: 9642,
  srarr: 8594,
  Sscr: 55349,
  sscr: 55349,
  ssetmn: 8726,
  ssmile: 8995,
  sstarf: 8902,
  Star: 8902,
  star: 9734,
  starf: 9733,
  straightepsilon: 1013,
  straightphi: 981,
  strns: 175,
  sub: 8834,
  Sub: 8912,
  subdot: 10941,
  subE: 10949,
  sube: 8838,
  subedot: 10947,
  submult: 10945,
  subnE: 10955,
  subne: 8842,
  subplus: 10943,
  subrarr: 10617,
  subset: 8834,
  Subset: 8912,
  subseteq: 8838,
  subseteqq: 10949,
  SubsetEqual: 8838,
  subsetneq: 8842,
  subsetneqq: 10955,
  subsim: 10951,
  subsub: 10965,
  subsup: 10963,
  succapprox: 10936,
  succ: 8827,
  succcurlyeq: 8829,
  Succeeds: 8827,
  SucceedsEqual: 10928,
  SucceedsSlantEqual: 8829,
  SucceedsTilde: 8831,
  succeq: 10928,
  succnapprox: 10938,
  succneqq: 10934,
  succnsim: 8937,
  succsim: 8831,
  SuchThat: 8715,
  sum: 8721,
  Sum: 8721,
  sung: 9834,
  sup1: 185,
  sup2: 178,
  sup3: 179,
  sup: 8835,
  Sup: 8913,
  supdot: 10942,
  supdsub: 10968,
  supE: 10950,
  supe: 8839,
  supedot: 10948,
  Superset: 8835,
  SupersetEqual: 8839,
  suphsol: 10185,
  suphsub: 10967,
  suplarr: 10619,
  supmult: 10946,
  supnE: 10956,
  supne: 8843,
  supplus: 10944,
  supset: 8835,
  Supset: 8913,
  supseteq: 8839,
  supseteqq: 10950,
  supsetneq: 8843,
  supsetneqq: 10956,
  supsim: 10952,
  supsub: 10964,
  supsup: 10966,
  swarhk: 10534,
  swarr: 8601,
  swArr: 8665,
  swarrow: 8601,
  swnwar: 10538,
  szlig: 223,
  Tab: NaN,
  target: 8982,
  Tau: 932,
  tau: 964,
  tbrk: 9140,
  Tcaron: 356,
  tcaron: 357,
  Tcedil: 354,
  tcedil: 355,
  Tcy: 1058,
  tcy: 1090,
  tdot: 8411,
  telrec: 8981,
  Tfr: 55349,
  tfr: 55349,
  there4: 8756,
  therefore: 8756,
  Therefore: 8756,
  Theta: 920,
  theta: 952,
  thetasym: 977,
  thetav: 977,
  thickapprox: 8776,
  thicksim: 8764,
  ThickSpace: 8287,
  ThinSpace: 8201,
  thinsp: 8201,
  thkap: 8776,
  thksim: 8764,
  THORN: 222,
  thorn: 254,
  tilde: 732,
  Tilde: 8764,
  TildeEqual: 8771,
  TildeFullEqual: 8773,
  TildeTilde: 8776,
  timesbar: 10801,
  timesb: 8864,
  times: 215,
  timesd: 10800,
  tint: 8749,
  toea: 10536,
  topbot: 9014,
  topcir: 10993,
  top: 8868,
  Topf: 55349,
  topf: 55349,
  topfork: 10970,
  tosa: 10537,
  tprime: 8244,
  trade: 8482,
  TRADE: 8482,
  triangle: 9653,
  triangledown: 9663,
  triangleleft: 9667,
  trianglelefteq: 8884,
  triangleq: 8796,
  triangleright: 9657,
  trianglerighteq: 8885,
  tridot: 9708,
  trie: 8796,
  triminus: 10810,
  TripleDot: 8411,
  triplus: 10809,
  trisb: 10701,
  tritime: 10811,
  trpezium: 9186,
  Tscr: 55349,
  tscr: 55349,
  TScy: 1062,
  tscy: 1094,
  TSHcy: 1035,
  tshcy: 1115,
  Tstrok: 358,
  tstrok: 359,
  twixt: 8812,
  twoheadleftarrow: 8606,
  twoheadrightarrow: 8608,
  Uacute: 218,
  uacute: 250,
  uarr: 8593,
  Uarr: 8607,
  uArr: 8657,
  Uarrocir: 10569,
  Ubrcy: 1038,
  ubrcy: 1118,
  Ubreve: 364,
  ubreve: 365,
  Ucirc: 219,
  ucirc: 251,
  Ucy: 1059,
  ucy: 1091,
  udarr: 8645,
  Udblac: 368,
  udblac: 369,
  udhar: 10606,
  ufisht: 10622,
  Ufr: 55349,
  ufr: 55349,
  Ugrave: 217,
  ugrave: 249,
  uHar: 10595,
  uharl: 8639,
  uharr: 8638,
  uhblk: 9600,
  ulcorn: 8988,
  ulcorner: 8988,
  ulcrop: 8975,
  ultri: 9720,
  Umacr: 362,
  umacr: 363,
  uml: 168,
  UnderBar: 95,
  UnderBrace: 9183,
  UnderBracket: 9141,
  UnderParenthesis: 9181,
  Union: 8899,
  UnionPlus: 8846,
  Uogon: 370,
  uogon: 371,
  Uopf: 55349,
  uopf: 55349,
  UpArrowBar: 10514,
  uparrow: 8593,
  UpArrow: 8593,
  Uparrow: 8657,
  UpArrowDownArrow: 8645,
  updownarrow: 8597,
  UpDownArrow: 8597,
  Updownarrow: 8661,
  UpEquilibrium: 10606,
  upharpoonleft: 8639,
  upharpoonright: 8638,
  uplus: 8846,
  UpperLeftArrow: 8598,
  UpperRightArrow: 8599,
  upsi: 965,
  Upsi: 978,
  upsih: 978,
  Upsilon: 933,
  upsilon: 965,
  UpTeeArrow: 8613,
  UpTee: 8869,
  upuparrows: 8648,
  urcorn: 8989,
  urcorner: 8989,
  urcrop: 8974,
  Uring: 366,
  uring: 367,
  urtri: 9721,
  Uscr: 55349,
  uscr: 55349,
  utdot: 8944,
  Utilde: 360,
  utilde: 361,
  utri: 9653,
  utrif: 9652,
  uuarr: 8648,
  Uuml: 220,
  uuml: 252,
  uwangle: 10663,
  vangrt: 10652,
  varepsilon: 1013,
  varkappa: 1008,
  varnothing: 8709,
  varphi: 981,
  varpi: 982,
  varpropto: 8733,
  varr: 8597,
  vArr: 8661,
  varrho: 1009,
  varsigma: 962,
  varsubsetneq: 8842,
  varsubsetneqq: 10955,
  varsupsetneq: 8843,
  varsupsetneqq: 10956,
  vartheta: 977,
  vartriangleleft: 8882,
  vartriangleright: 8883,
  vBar: 10984,
  Vbar: 10987,
  vBarv: 10985,
  Vcy: 1042,
  vcy: 1074,
  vdash: 8866,
  vDash: 8872,
  Vdash: 8873,
  VDash: 8875,
  Vdashl: 10982,
  veebar: 8891,
  vee: 8744,
  Vee: 8897,
  veeeq: 8794,
  vellip: 8942,
  verbar: 124,
  Verbar: 8214,
  vert: 124,
  Vert: 8214,
  VerticalBar: 8739,
  VerticalLine: 124,
  VerticalSeparator: 10072,
  VerticalTilde: 8768,
  VeryThinSpace: 8202,
  Vfr: 55349,
  vfr: 55349,
  vltri: 8882,
  vnsub: 8834,
  vnsup: 8835,
  Vopf: 55349,
  vopf: 55349,
  vprop: 8733,
  vrtri: 8883,
  Vscr: 55349,
  vscr: 55349,
  vsubnE: 10955,
  vsubne: 8842,
  vsupnE: 10956,
  vsupne: 8843,
  Vvdash: 8874,
  vzigzag: 10650,
  Wcirc: 372,
  wcirc: 373,
  wedbar: 10847,
  wedge: 8743,
  Wedge: 8896,
  wedgeq: 8793,
  weierp: 8472,
  Wfr: 55349,
  wfr: 55349,
  Wopf: 55349,
  wopf: 55349,
  wp: 8472,
  wr: 8768,
  wreath: 8768,
  Wscr: 55349,
  wscr: 55349,
  xcap: 8898,
  xcirc: 9711,
  xcup: 8899,
  xdtri: 9661,
  Xfr: 55349,
  xfr: 55349,
  xharr: 10231,
  xhArr: 10234,
  Xi: 926,
  xi: 958,
  xlarr: 10229,
  xlArr: 10232,
  xmap: 10236,
  xnis: 8955,
  xodot: 10752,
  Xopf: 55349,
  xopf: 55349,
  xoplus: 10753,
  xotime: 10754,
  xrarr: 10230,
  xrArr: 10233,
  Xscr: 55349,
  xscr: 55349,
  xsqcup: 10758,
  xuplus: 10756,
  xutri: 9651,
  xvee: 8897,
  xwedge: 8896,
  Yacute: 221,
  yacute: 253,
  YAcy: 1071,
  yacy: 1103,
  Ycirc: 374,
  ycirc: 375,
  Ycy: 1067,
  ycy: 1099,
  yen: 165,
  Yfr: 55349,
  yfr: 55349,
  YIcy: 1031,
  yicy: 1111,
  Yopf: 55349,
  yopf: 55349,
  Yscr: 55349,
  yscr: 55349,
  YUcy: 1070,
  yucy: 1102,
  yuml: 255,
  Yuml: 376,
  Zacute: 377,
  zacute: 378,
  Zcaron: 381,
  zcaron: 382,
  Zcy: 1047,
  zcy: 1079,
  Zdot: 379,
  zdot: 380,
  zeetrf: 8488,
  ZeroWidthSpace: 8203,
  Zeta: 918,
  zeta: 950,
  zfr: 55349,
  Zfr: 8488,
  ZHcy: 1046,
  zhcy: 1078,
  zigrarr: 8669,
  zopf: 55349,
  Zopf: 8484,
  Zscr: 55349,
  zscr: 55349,
  zwj: 8205,
  zwnj: 8204 };

var entityToChar = function(m) {
    "use strict";
    var isNumeric = /^&#/.test(m);
    var isHex = /^&#[Xx]/.test(m);
    var uchar;
    var ucode;
    if (isNumeric) {
        var num;
        if (isHex) {
            num = parseInt(m.slice(3, -1), 16);
        } else {
            num = parseInt(m.slice(2, -1), 10);
        }
        uchar = fromCodePoint(num);
    } else {
        ucode = entities[m.slice(1, -1)];
        if (ucode) {
            uchar = fromCodePoint(entities[m.slice(1, -1)]);
        }
    }
    return (uchar || m);
};

module.exports.entityToChar = entityToChar;

},{"./from-code-point":7}],10:[function(require,module,exports){
// commonmark.js - CommomMark in JavaScript
// Copyright (C) 2014 John MacFarlane
// License: BSD3.

// Basic usage:
//
// var commonmark = require('commonmark');
// var parser = new commonmark.DocParser();
// var renderer = new commonmark.HtmlRenderer();
// console.log(renderer.render(parser.parse('Hello *world*')));

"use strict";

var util = require('util');

var renderAST = function(tree) {
    return util.inspect(tree, {depth: null});
};

module.exports.DocParser = require('./blocks');
module.exports.HtmlRenderer = require('./html-renderer');
module.exports.ASTRenderer = renderAST;

},{"./blocks":6,"./html-renderer":8,"util":27}],11:[function(require,module,exports){
var fromCodePoint = require('./from-code-point.js');
var entityToChar = require('./html5-entities.js').entityToChar;

// Constants for character codes:

var C_NEWLINE = 10;
var C_SPACE = 32;
var C_ASTERISK = 42;
var C_UNDERSCORE = 95;
var C_BACKTICK = 96;
var C_OPEN_BRACKET = 91;
var C_CLOSE_BRACKET = 93;
var C_LESSTHAN = 60;
var C_BANG = 33;
var C_BACKSLASH = 92;
var C_AMPERSAND = 38;
var C_OPEN_PAREN = 40;
var C_COLON = 58;

// Some regexps used in inline parser:

var ESCAPABLE = '[!"#$%&\'()*+,./:;<=>?@[\\\\\\]^_`{|}~-]';
var ESCAPED_CHAR = '\\\\' + ESCAPABLE;
var REG_CHAR = '[^\\\\()\\x00-\\x20]';
var IN_PARENS_NOSP = '\\((' + REG_CHAR + '|' + ESCAPED_CHAR + ')*\\)';
var TAGNAME = '[A-Za-z][A-Za-z0-9]*';
var ATTRIBUTENAME = '[a-zA-Z_:][a-zA-Z0-9:._-]*';
var UNQUOTEDVALUE = "[^\"'=<>`\\x00-\\x20]+";
var SINGLEQUOTEDVALUE = "'[^']*'";
var DOUBLEQUOTEDVALUE = '"[^"]*"';
var ATTRIBUTEVALUE = "(?:" + UNQUOTEDVALUE + "|" + SINGLEQUOTEDVALUE + "|" + DOUBLEQUOTEDVALUE + ")";
var ATTRIBUTEVALUESPEC = "(?:" + "\\s*=" + "\\s*" + ATTRIBUTEVALUE + ")";
var ATTRIBUTE = "(?:" + "\\s+" + ATTRIBUTENAME + ATTRIBUTEVALUESPEC + "?)";
var OPENTAG = "<" + TAGNAME + ATTRIBUTE + "*" + "\\s*/?>";
var CLOSETAG = "</" + TAGNAME + "\\s*[>]";
var HTMLCOMMENT = "<!--([^-]+|[-][^-]+)*-->";
var PROCESSINGINSTRUCTION = "[<][?].*?[?][>]";
var DECLARATION = "<![A-Z]+" + "\\s+[^>]*>";
var CDATA = "<!\\[CDATA\\[([^\\]]+|\\][^\\]]|\\]\\][^>])*\\]\\]>";
var HTMLTAG = "(?:" + OPENTAG + "|" + CLOSETAG + "|" + HTMLCOMMENT + "|" +
        PROCESSINGINSTRUCTION + "|" + DECLARATION + "|" + CDATA + ")";
var ENTITY = "&(?:#x[a-f0-9]{1,8}|#[0-9]{1,8}|[a-z][a-z0-9]{1,31});";

var rePunctuation = new RegExp(/^[\u2000-\u206F\u2E00-\u2E7F\\'!"#\$%&\(\)\*\+,\-\.\/:;<=>\?@\[\]\^_`\{\|\}~]/);

var reHtmlTag = new RegExp('^' + HTMLTAG, 'i');

var reLinkTitle = new RegExp(
    '^(?:"(' + ESCAPED_CHAR + '|[^"\\x00])*"' +
        '|' +
        '\'(' + ESCAPED_CHAR + '|[^\'\\x00])*\'' +
        '|' +
        '\\((' + ESCAPED_CHAR + '|[^)\\x00])*\\))');

var reLinkDestinationBraces = new RegExp(
    '^(?:[<](?:[^<>\\n\\\\\\x00]' + '|' + ESCAPED_CHAR + '|' + '\\\\)*[>])');

var reLinkDestination = new RegExp(
    '^(?:' + REG_CHAR + '+|' + ESCAPED_CHAR + '|' + IN_PARENS_NOSP + ')*');

var reEscapable = new RegExp(ESCAPABLE);

var reAllEscapedChar = new RegExp('\\\\(' + ESCAPABLE + ')', 'g');

var reEntityHere = new RegExp('^' + ENTITY, 'i');

var reEntity = new RegExp(ENTITY, 'gi');

// Matches a character with a special meaning in markdown,
// or a string of non-special characters.  Note:  we match
// clumps of _ or * or `, because they need to be handled in groups.
var reMain = /^(?:[_*`\n]+|[\[\]\\!<&*_]|(?: *[^\n `\[\]\\!<&*_]+)+|[ \n]+)/m;

// Replace entities and backslash escapes with literal characters.
var unescapeString = function(s) {
    return s.replace(reAllEscapedChar, '$1')
            .replace(reEntity, entityToChar);
};

// Normalize reference label: collapse internal whitespace
// to single space, remove leading/trailing whitespace, case fold.
var normalizeReference = function(s) {
    return s.trim()
        .replace(/\s+/, ' ')
        .toUpperCase();
};

// INLINE PARSER

// These are methods of an InlineParser object, defined below.
// An InlineParser keeps track of a subject (a string to be
// parsed) and a position in that subject.

// If re matches at current position in the subject, advance
// position in subject and return the match; otherwise return null.
var match = function(re) {
    var m = re.exec(this.subject.slice(this.pos));
    if (m) {
        this.pos += m.index + m[0].length;
        return m[0];
    } else {
        return null;
    }
};

// Returns the code for the character at the current subject position, or -1
// there are no more characters.
var peek = function() {
    if (this.pos < this.subject.length) {
        return this.subject.charCodeAt(this.pos);
    } else {
        return -1;
    }
};

// Parse zero or more space characters, including at most one newline
var spnl = function() {
    this.match(/^ *(?:\n *)?/);
    return 1;
};

// All of the parsers below try to match something at the current position
// in the subject.  If they succeed in matching anything, they
// return the inline matched, advancing the subject.

// Attempt to parse backticks, returning either a backtick code span or a
// literal sequence of backticks.
var parseBackticks = function(inlines) {
    var ticks = this.match(/^`+/);
    if (!ticks) {
        return 0;
    }
    var afterOpenTicks = this.pos;
    var foundCode = false;
    var matched;
    while (!foundCode && (matched = this.match(/`+/m))) {
        if (matched === ticks) {
            inlines.push({ t: 'Code', c: this.subject.slice(afterOpenTicks,
                                                      this.pos - ticks.length)
                     .replace(/[ \n]+/g, ' ')
                      .trim() });
            return true;
        }
    }
    // If we got here, we didn't match a closing backtick sequence.
    this.pos = afterOpenTicks;
    inlines.push({ t: 'Text', c: ticks });
    return true;
};

// Parse a backslash-escaped special character, adding either the escaped
// character, a hard line break (if the backslash is followed by a newline),
// or a literal backslash to the 'inlines' list.
var parseBackslash = function(inlines) {
    var subj = this.subject,
        pos = this.pos;
    if (subj.charCodeAt(pos) === C_BACKSLASH) {
        if (subj.charAt(pos + 1) === '\n') {
            this.pos = this.pos + 2;
            inlines.push({ t: 'Hardbreak' });
        } else if (reEscapable.test(subj.charAt(pos + 1))) {
            this.pos = this.pos + 2;
            inlines.push({ t: 'Text', c: subj.charAt(pos + 1) });
        } else {
            this.pos++;
            inlines.push({t: 'Text', c: '\\'});
        }
        return true;
    } else {
        return false;
    }
};

// Attempt to parse an autolink (URL or email in pointy brackets).
var parseAutolink = function(inlines) {
    var m;
    var dest;
    if ((m = this.match(/^<([a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)>/))) {  // email autolink
        dest = m.slice(1, -1);
        inlines.push(
                {t: 'Link',
                 label: [{ t: 'Text', c: dest }],
                 destination: 'mailto:' + encodeURI(unescape(dest)) });
        return true;
    } else if ((m = this.match(/^<(?:coap|doi|javascript|aaa|aaas|about|acap|cap|cid|crid|data|dav|dict|dns|file|ftp|geo|go|gopher|h323|http|https|iax|icap|im|imap|info|ipp|iris|iris.beep|iris.xpc|iris.xpcs|iris.lwz|ldap|mailto|mid|msrp|msrps|mtqp|mupdate|news|nfs|ni|nih|nntp|opaquelocktoken|pop|pres|rtsp|service|session|shttp|sieve|sip|sips|sms|snmp|soap.beep|soap.beeps|tag|tel|telnet|tftp|thismessage|tn3270|tip|tv|urn|vemmi|ws|wss|xcon|xcon-userid|xmlrpc.beep|xmlrpc.beeps|xmpp|z39.50r|z39.50s|adiumxtra|afp|afs|aim|apt|attachment|aw|beshare|bitcoin|bolo|callto|chrome|chrome-extension|com-eventbrite-attendee|content|cvs|dlna-playsingle|dlna-playcontainer|dtn|dvb|ed2k|facetime|feed|finger|fish|gg|git|gizmoproject|gtalk|hcp|icon|ipn|irc|irc6|ircs|itms|jar|jms|keyparc|lastfm|ldaps|magnet|maps|market|message|mms|ms-help|msnim|mumble|mvn|notes|oid|palm|paparazzi|platform|proxy|psyc|query|res|resource|rmi|rsync|rtmp|secondlife|sftp|sgn|skype|smb|soldat|spotify|ssh|steam|svn|teamspeak|things|udp|unreal|ut2004|ventrilo|view-source|webcal|wtai|wyciwyg|xfire|xri|ymsgr):[^<>\x00-\x20]*>/i))) {
        dest = m.slice(1, -1);
        inlines.push({
                  t: 'Link',
                  label: [{ t: 'Text', c: dest }],
                  destination: encodeURI(unescape(dest)) });
        return true;
    } else {
        return false;
    }
};

// Attempt to parse a raw HTML tag.
var parseHtmlTag = function(inlines) {
    var m = this.match(reHtmlTag);
    if (m) {
        inlines.push({ t: 'Html', c: m });
        return true;
    } else {
        return false;
    }
};

// Scan a sequence of characters with code cc, and return information about
// the number of delimiters and whether they are positioned such that
// they can open and/or close emphasis or strong emphasis.  A utility
// function for strong/emph parsing.
var scanDelims = function(cc) {
    var numdelims = 0;
    var char_before, char_after, cc_after;
    var startpos = this.pos;

    char_before = this.pos === 0 ? '\n' :
        this.subject.charAt(this.pos - 1);

    while (this.peek() === cc) {
        numdelims++;
        this.pos++;
    }

    cc_after = this.peek();
    if (cc_after === -1) {
        char_after = '\n';
    } else {
        char_after = fromCodePoint(cc_after);
    }

    var can_open = numdelims > 0 && !(/\s/.test(char_after)) &&
            !(rePunctuation.test(char_after) &&
             !(/\s/.test(char_before)) &&
             !(rePunctuation.test(char_before)));
    var can_close = numdelims > 0 && !(/\s/.test(char_before)) &&
            !(rePunctuation.test(char_before) &&
              !(/\s/.test(char_after)) &&
              !(rePunctuation.test(char_after)));
    if (cc === C_UNDERSCORE) {
        can_open = can_open && !((/[a-z0-9]/i).test(char_before));
        can_close = can_close && !((/[a-z0-9]/i).test(char_after));
    }
    this.pos = startpos;
    return { numdelims: numdelims,
             can_open: can_open,
             can_close: can_close };
};

var Emph = function(ils) {
    return {t: 'Emph', c: ils};
};

var Strong = function(ils) {
    return {t: 'Strong', c: ils};
};

var Str = function(s) {
    return {t: 'Text', c: s};
};

// Attempt to parse emphasis or strong emphasis.
var parseEmphasis = function(cc, inlines) {

    var res = this.scanDelims(cc);
    var numdelims = res.numdelims;
    var startpos = this.pos;

    if (numdelims === 0) {
        return false;
    }

    this.pos += numdelims;
    inlines.push(Str(this.subject.slice(startpos, this.pos)));

    // Add entry to stack for this opener
    this.delimiters = { cc: cc,
                        numdelims: numdelims,
                        pos: inlines.length - 1,
                        previous: this.delimiters,
                        next: null,
                        can_open: res.can_open,
                        can_close: res.can_close,
                        active: true };
    if (this.delimiters.previous !== null) {
        this.delimiters.previous.next = this.delimiters;
    }

    return true;

};

var removeDelimiter = function(delim) {
    if (delim.previous !== null) {
        delim.previous.next = delim.next;
    }
    if (delim.next === null) {
        // top of stack
        this.delimiters = delim.previous;
    } else {
        delim.next.previous = delim.previous;
    }
};

var removeGaps = function(inlines) {
    // remove gaps from inlines
    var i, j;
    j = 0;
    for (i = 0 ; i < inlines.length; i++) {
        if (inlines[i] !== null) {
            inlines[j] = inlines[i];
            j++;
        }
    }
    inlines.splice(j);
};

var processEmphasis = function(inlines, stack_bottom) {
    "use strict";
    var opener, closer;
    var opener_inl, closer_inl;
    var nextstack, tempstack;
    var use_delims;
    var contents;
    var emph;
    var i;

    // find first closer above stack_bottom:
    closer = this.delimiters;
    while (closer !== null && closer.previous !== stack_bottom) {
        closer = closer.previous;
    }
    // move forward, looking for closers, and handling each
    while (closer !== null) {
        if (closer.can_close && (closer.cc === C_UNDERSCORE || closer.cc === C_ASTERISK)) {
            // found emphasis closer. now look back for first matching opener:
            opener = closer.previous;
            while (opener !== null && opener !== stack_bottom) {
                if (opener.cc === closer.cc && opener.can_open) {
                    break;
                }
                opener = opener.previous;
            }
            if (opener !== null && opener !== stack_bottom) {
                // calculate actual number of delimiters used from this closer
                if (closer.numdelims < 3 || opener.numdelims < 3) {
                    use_delims = closer.numdelims <= opener.numdelims ?
                        closer.numdelims : opener.numdelims;
                } else {
                    use_delims = closer.numdelims % 2 === 0 ? 2 : 1;
                }

                opener_inl = inlines[opener.pos];
                closer_inl = inlines[closer.pos];

                // remove used delimiters from stack elts and inlines
                opener.numdelims -= use_delims;
                closer.numdelims -= use_delims;
                opener_inl.c = opener_inl.c.slice(0, opener_inl.c.length - use_delims);
                closer_inl.c = closer_inl.c.slice(0, closer_inl.c.length - use_delims);

                // build contents for new emph element
                contents = inlines.slice(opener.pos + 1, closer.pos);
                removeGaps(contents);

                emph = use_delims === 1 ? Emph(contents) : Strong(contents);

                // insert into list of inlines
                inlines[opener.pos + 1] = emph;
                for (i = opener.pos + 2; i < closer.pos; i++) {
                    inlines[i] = null;
                }

                // remove elts btw opener and closer in delimiters stack
                tempstack = closer.previous;
                while (tempstack !== null && tempstack !== opener) {
                    nextstack = tempstack.previous;
                    this.removeDelimiter(tempstack);
                    tempstack = nextstack;
                }

                // if opener has 0 delims, remove it and the inline
                if (opener.numdelims === 0) {
                    inlines[opener.pos] = null;
                    this.removeDelimiter(opener);
                }

                if (closer.numdelims === 0) {
                    inlines[closer.pos] = null;
                    tempstack = closer.next;
                    this.removeDelimiter(closer);
                    closer = tempstack;
                }


            } else {
                closer = closer.next;
            }

        } else {
            closer = closer.next;
        }

    }

    removeGaps(inlines);

    // remove all delimiters
    while (this.delimiters !== stack_bottom) {
        this.removeDelimiter(this.delimiters);
    }
};

// Attempt to parse link title (sans quotes), returning the string
// or null if no match.
var parseLinkTitle = function() {
    var title = this.match(reLinkTitle);
    if (title) {
        // chop off quotes from title and unescape:
        return unescapeString(title.substr(1, title.length - 2));
    } else {
        return null;
    }
};

// Attempt to parse link destination, returning the string or
// null if no match.
var parseLinkDestination = function() {
    var res = this.match(reLinkDestinationBraces);
    if (res) {  // chop off surrounding <..>:
        return encodeURI(unescape(unescapeString(res.substr(1, res.length - 2))));
    } else {
        res = this.match(reLinkDestination);
        if (res !== null) {
            return encodeURI(unescape(unescapeString(res)));
        } else {
            return null;
        }
    }
};

// Attempt to parse a link label, returning number of characters parsed.
var parseLinkLabel = function() {
    var m = this.match(/^\[(?:[^\\\[\]]|\\[\[\]]){0,1000}\]/);
    return m === null ? 0 : m.length;
};

// Add open bracket to delimiter stack and add a Str to inlines.
var parseOpenBracket = function(inlines) {

    var startpos = this.pos;
    this.pos += 1;

    inlines.push(Str("["));

    // Add entry to stack for this opener
    this.delimiters = { cc: C_OPEN_BRACKET,
                        numdelims: 1,
                        pos: inlines.length - 1,
                        previous: this.delimiters,
                        next: null,
                        can_open: true,
                        can_close: false,
                        index: startpos,
                        active: true };
    if (this.delimiters.previous !== null) {
        this.delimiters.previous.next = this.delimiters;
    }

    return true;

};

// IF next character is [, and ! delimiter to delimiter stack and
// add a Str to inlines.  Otherwise just add a Str.
var parseBang = function(inlines) {

    var startpos = this.pos;
    this.pos += 1;
    if (this.peek() === C_OPEN_BRACKET) {
        this.pos += 1;
        inlines.push(Str("!["));

        // Add entry to stack for this opener
        this.delimiters = { cc: C_BANG,
                            numdelims: 1,
                            pos: inlines.length - 1,
                            previous: this.delimiters,
                            next: null,
                            can_open: true,
                            can_close: false,
                            index: startpos + 1,
                            active: true };
        if (this.delimiters.previous !== null) {
            this.delimiters.previous.next = this.delimiters;
        }
    } else {
        inlines.push(Str("!"));
    }
    return true;
};

// Try to match close bracket against an opening in the delimiter
// stack.  Add either a link or image, or a plain [ character,
// to the inlines stack.  If there is a matching delimiter,
// remove it from the delimiter stack.
var parseCloseBracket = function(inlines) {
    var startpos;
    var is_image;
    var dest;
    var title;
    var matched = false;
    var link_text;
    var i;
    var reflabel;
    var opener;

    this.pos += 1;
    startpos = this.pos;

    // look through stack of delimiters for a [ or ![
    opener = this.delimiters;

    while (opener !== null) {
        if (opener.cc === C_OPEN_BRACKET || opener.cc === C_BANG) {
            break;
        }
        opener = opener.previous;
    }

    if (opener === null) {
        // no matched opener, just return a literal
        inlines.push(Str("]"));
        return true;
    }

    if (!opener.active) {
        // no matched opener, just return a literal
        inlines.push(Str("]"));
        // take opener off emphasis stack
        this.removeDelimiter(opener);
        return true;
    }

    // If we got here, open is a potential opener
    is_image = opener.cc === C_BANG;
    // instead of copying a slice, we null out the
    // parts of inlines that don't correspond to link_text;
    // later, we'll collapse them.  This is awkward, and could
    // be simplified if we made inlines a linked list rather than
    // an array:
    link_text = inlines.slice(0);
    for (i = 0; i < opener.pos + 1; i++) {
        link_text[i] = null;
    }

    // Check to see if we have a link/image

    // Inline link?
    if (this.peek() === C_OPEN_PAREN) {
        this.pos++;
        if (this.spnl() &&
            ((dest = this.parseLinkDestination()) !== null) &&
            this.spnl() &&
            // make sure there's a space before the title:
            (/^\s/.test(this.subject.charAt(this.pos - 1)) &&
             (title = this.parseLinkTitle() || '') || true) &&
            this.spnl() &&
            this.match(/^\)/)) {
            matched = true;
        }
    } else {

        // Next, see if there's a link label
        var savepos = this.pos;
        this.spnl();
        var beforelabel = this.pos;
        var n = this.parseLinkLabel();
        if (n === 0 || n === 2) {
            // empty or missing second label
            reflabel = this.subject.slice(opener.index, startpos);
        } else {
            reflabel = this.subject.slice(beforelabel, beforelabel + n);
        }
        if (n === 0) {
            // If shortcut reference link, rewind before spaces we skipped.
            this.pos = savepos;
        }

        // lookup rawlabel in refmap
        var link = this.refmap[normalizeReference(reflabel)];
        if (link) {
            dest = link.destination;
            title = link.title;
            matched = true;
        }
    }

    if (matched) {
        this.processEmphasis(link_text, opener.previous);

        // remove the part of inlines that became link_text.
        // see note above on why we need to do this instead of splice:
        for (i = opener.pos; i < inlines.length; i++) {
            inlines[i] = null;
        }

        // processEmphasis will remove this and later delimiters.
        // Now, for a link, we also deactivate earlier link openers.
        // (no links in links)
        if (!is_image) {
          opener = this.delimiters;
          while (opener !== null) {
            if (opener.cc === C_OPEN_BRACKET) {
                opener.active = false; // deactivate this opener
            }
            opener = opener.previous;
          }
        }

        inlines.push({t: is_image ? 'Image' : 'Link',
                      destination: dest,
                      title: title,
                      label: link_text});
        return true;

    } else { // no match

        this.removeDelimiter(opener);  // remove this opener from stack
        this.pos = startpos;
        inlines.push(Str("]"));
        return true;
    }

};

// Attempt to parse an entity, return Entity object if successful.
var parseEntity = function(inlines) {
    var m;
    if ((m = this.match(reEntityHere))) {
        inlines.push({ t: 'Text', c: entityToChar(m) });
        return true;
    } else {
        return false;
    }
};

// Parse a run of ordinary characters, or a single character with
// a special meaning in markdown, as a plain string, adding to inlines.
var parseString = function(inlines) {
    var m;
    if ((m = this.match(reMain))) {
        inlines.push({ t: 'Text', c: m });
        return true;
    } else {
        return false;
    }
};

// Parse a newline.  If it was preceded by two spaces, return a hard
// line break; otherwise a soft line break.
var parseNewline = function(inlines) {
    var m = this.match(/^ *\n/);
    if (m) {
        if (m.length > 2) {
            inlines.push({ t: 'Hardbreak' });
        } else if (m.length > 0) {
            inlines.push({ t: 'Softbreak' });
        }
        return true;
    }
    return false;
};

// Attempt to parse a link reference, modifying refmap.
var parseReference = function(s, refmap) {
    this.subject = s;
    this.pos = 0;
    this.label_nest_level = 0;
    var rawlabel;
    var dest;
    var title;
    var matchChars;
    var startpos = this.pos;

    // label:
    matchChars = this.parseLinkLabel();
    if (matchChars === 0) {
        return 0;
    } else {
        rawlabel = this.subject.substr(0, matchChars);
    }

    // colon:
    if (this.peek() === C_COLON) {
        this.pos++;
    } else {
        this.pos = startpos;
        return 0;
    }

    //  link url
    this.spnl();

    dest = this.parseLinkDestination();
    if (dest === null || dest.length === 0) {
        this.pos = startpos;
        return 0;
    }

    var beforetitle = this.pos;
    this.spnl();
    title = this.parseLinkTitle();
    if (title === null) {
        title = '';
        // rewind before spaces
        this.pos = beforetitle;
    }

    // make sure we're at line end:
    if (this.match(/^ *(?:\n|$)/) === null) {
        this.pos = startpos;
        return 0;
    }

    var normlabel = normalizeReference(rawlabel);

    if (!refmap[normlabel]) {
        refmap[normlabel] = { destination: dest, title: title };
    }
    return this.pos - startpos;
};

// Parse the next inline element in subject, advancing subject position.
// On success, add the result to the inlines list, and return true.
// On failure, return false.
var parseInline = function(inlines) {
    "use strict";
    var c = this.peek();
    if (c === -1) {
        return false;
    }
    var res;
    switch(c) {
    case C_NEWLINE:
    case C_SPACE:
        res = this.parseNewline(inlines);
        break;
    case C_BACKSLASH:
        res = this.parseBackslash(inlines);
        break;
    case C_BACKTICK:
        res = this.parseBackticks(inlines);
        break;
    case C_ASTERISK:
    case C_UNDERSCORE:
        res = this.parseEmphasis(c, inlines);
        break;
    case C_OPEN_BRACKET:
        res = this.parseOpenBracket(inlines);
        break;
    case C_BANG:
        res = this.parseBang(inlines);
        break;
    case C_CLOSE_BRACKET:
        res = this.parseCloseBracket(inlines);
        break;
    case C_LESSTHAN:
        res = this.parseAutolink(inlines) || this.parseHtmlTag(inlines);
        break;
    case C_AMPERSAND:
        res = this.parseEntity(inlines);
        break;
    default:
        res = this.parseString(inlines);
        break;
    }
    if (!res) {
        this.pos += 1;
        inlines.push({t: 'Text', c: fromCodePoint(c)});
    }

    return true;
};

// Parse s as a list of inlines, using refmap to resolve references.
var parseInlines = function(s, refmap) {
    this.subject = s;
    this.pos = 0;
    this.refmap = refmap || {};
    this.delimiters = null;
    var inlines = [];
    while (this.parseInline(inlines)) {
    }
    this.processEmphasis(inlines, null);
    return inlines;
};

// The InlineParser object.
function InlineParser(){
    "use strict";
    return {
        subject: '',
        label_nest_level: 0, // used by parseLinkLabel method
        delimiters: null,  // used by parseEmphasis method
        pos: 0,
        refmap: {},
        match: match,
        peek: peek,
        spnl: spnl,
        unescapeString: unescapeString,
        parseBackticks: parseBackticks,
        parseBackslash: parseBackslash,
        parseAutolink: parseAutolink,
        parseHtmlTag: parseHtmlTag,
        scanDelims: scanDelims,
        parseEmphasis: parseEmphasis,
        parseLinkTitle: parseLinkTitle,
        parseLinkDestination: parseLinkDestination,
        parseLinkLabel: parseLinkLabel,
        parseOpenBracket: parseOpenBracket,
        parseCloseBracket: parseCloseBracket,
        parseBang: parseBang,
        parseEntity: parseEntity,
        parseString: parseString,
        parseNewline: parseNewline,
        parseReference: parseReference,
        parseInline: parseInline,
        processEmphasis: processEmphasis,
        removeDelimiter: removeDelimiter,
        parse: parseInlines
    };
}

module.exports = InlineParser;


},{"./from-code-point.js":7,"./html5-entities.js":9}],12:[function(require,module,exports){
'use strict';

function ToObject(val) {
	if (val == null) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

module.exports = Object.assign || function (target, source) {
	var from;
	var keys;
	var to = ToObject(target);

	for (var s = 1; s < arguments.length; s++) {
		from = arguments[s];
		keys = Object.keys(Object(from));

		for (var i = 0; i < keys.length; i++) {
			to[keys[i]] = from[keys[i]];
		}
	}

	return to;
};

},{}],13:[function(require,module,exports){
(function (process){
// LICENSE : MIT
"use strict";
var pattern = pattern = '^(' +
'((= yaml =)|(---))' +
'$([\\s\\S]*?)' +
'\\2' +
'$' +
(process.platform === 'win32' ? '\\r?' : '') +
'(?:\\n)?)';
var yamlRegexp = new RegExp(pattern, 'm');
function replaceByBr(text) {
    return text.replace(yamlRegexp, function (all) {
        var lines = all.split("\n");
        return (new Array(lines.length)).join("\n");
    });

}
function normalize(markdown) {
    if (yamlRegexp.test(markdown)) {
        return replaceByBr(markdown);
    }
    return markdown;
}
module.exports = normalize;

}).call(this,require('_process'))
},{"_process":25}],14:[function(require,module,exports){
"use strict";

var StructuredSource = require('./structured-source.js')["default"];


module.exports = StructuredSource;

/* vim: set sw=4 ts=4 et tw=80 : */

},{"./structured-source.js":15}],15:[function(require,module,exports){
"use strict";

var _classProps = function (child, staticProps, instanceProps) {
  if (staticProps) Object.defineProperties(child, staticProps);
  if (instanceProps) Object.defineProperties(child.prototype, instanceProps);
};

var upperBound = require('boundary').upperBound;
var Position = function Position(line, column) {
  this.line = line;
  this.column = column;
};

exports.Position = Position;
var SourceLocation = function SourceLocation(start, end) {
  this.start = start;
  this.end = end;
};

exports.SourceLocation = SourceLocation;
var StructuredSource = (function () {
  var StructuredSource =
  /**
   * @constructs StructuredSource
   * @param {string} source - source code text.
   */
  function StructuredSource(source) {
    this.indice = [0];
    var regexp = /[\r\n\u2028\u2029]/g;
    var length = source.length;
    regexp.lastIndex = 0;
    while (true) {
      var result = regexp.exec(source);
      if (!result) {
        break;
      }
      var index = result.index;
      if (source.charCodeAt(index) === 13 /* '\r' */ && source.charCodeAt(index + 1) === 10 /* '\n' */) {
        index += 1;
      }
      var nextIndex = index + 1;
      // If there's a last line terminator, we push it to the indice.
      // So use < instead of <=.
      if (length < nextIndex) {
        break;
      }
      this.indice.push(nextIndex);
      regexp.lastIndex = nextIndex;
    }
  };

  StructuredSource.prototype.locationToRange = function (loc) {
    return [this.positionToIndex(loc.start), this.positionToIndex(loc.end)];
  };

  StructuredSource.prototype.rangeToLocation = function (range) {
    return new SourceLocation(this.indexToPosition(range[0]), this.indexToPosition(range[1]));
  };

  StructuredSource.prototype.positionToIndex = function (pos) {
    // Line number starts with 1.
    // Column number starts with 0.
    var start = this.indice[pos.line - 1];
    return start + pos.column;
  };

  StructuredSource.prototype.indexToPosition = function (index) {
    var startLine = upperBound(this.indice, index);
    return new Position(startLine, index - this.indice[startLine - 1]);
  };

  _classProps(StructuredSource, null, {
    line: {
      get: function () {
        return this.indice.length;
      }
    }
  });

  return StructuredSource;
})();

exports["default"] = StructuredSource;

},{"boundary":16}],16:[function(require,module,exports){
"use strict";

/*
  Copyright (C) 2014 Yusuke Suzuki <utatane.tea@gmail.com>

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

function compare(v1, v2) {
  return v1 < v2;
}

function upperBound(array, value, comp) {
  if (comp === undefined) comp = compare;
  return (function () {
    var len = array.length;
    var i = 0;

    while (len) {
      var diff = len >>> 1;
      var cursor = i + diff;
      if (comp(value, array[cursor])) {
        len = diff;
      } else {
        i = cursor + 1;
        len -= diff + 1;
      }
    }
    return i;
  })();
}

function lowerBound(array, value, comp) {
  if (comp === undefined) comp = compare;
  return (function () {
    var len = array.length;
    var i = 0;

    while (len) {
      var diff = len >>> 1;
      var cursor = i + diff;
      if (comp(array[cursor], value)) {
        i = cursor + 1;
        len -= diff + 1;
      } else {
        len = diff;
      }
    }
    return i;
  })();
}

function binarySearch(array, value, comp) {
  if (comp === undefined) comp = compare;
  return (function () {
    var cursor = lowerBound(array, value, comp);
    return cursor !== array.length && !comp(value, array[cursor]);
  })();
}

exports.compare = compare;
exports.lowerBound = lowerBound;
exports.upperBound = upperBound;
exports.binarySearch = binarySearch;

},{}],17:[function(require,module,exports){
var traverse = module.exports = function (obj) {
    return new Traverse(obj);
};

function Traverse (obj) {
    this.value = obj;
}

Traverse.prototype.get = function (ps) {
    var node = this.value;
    for (var i = 0; i < ps.length; i ++) {
        var key = ps[i];
        if (!node || !hasOwnProperty.call(node, key)) {
            node = undefined;
            break;
        }
        node = node[key];
    }
    return node;
};

Traverse.prototype.has = function (ps) {
    var node = this.value;
    for (var i = 0; i < ps.length; i ++) {
        var key = ps[i];
        if (!node || !hasOwnProperty.call(node, key)) {
            return false;
        }
        node = node[key];
    }
    return true;
};

Traverse.prototype.set = function (ps, value) {
    var node = this.value;
    for (var i = 0; i < ps.length - 1; i ++) {
        var key = ps[i];
        if (!hasOwnProperty.call(node, key)) node[key] = {};
        node = node[key];
    }
    node[ps[i]] = value;
    return value;
};

Traverse.prototype.map = function (cb) {
    return walk(this.value, cb, true);
};

Traverse.prototype.forEach = function (cb) {
    this.value = walk(this.value, cb, false);
    return this.value;
};

Traverse.prototype.reduce = function (cb, init) {
    var skip = arguments.length === 1;
    var acc = skip ? this.value : init;
    this.forEach(function (x) {
        if (!this.isRoot || !skip) {
            acc = cb.call(this, acc, x);
        }
    });
    return acc;
};

Traverse.prototype.paths = function () {
    var acc = [];
    this.forEach(function (x) {
        acc.push(this.path); 
    });
    return acc;
};

Traverse.prototype.nodes = function () {
    var acc = [];
    this.forEach(function (x) {
        acc.push(this.node);
    });
    return acc;
};

Traverse.prototype.clone = function () {
    var parents = [], nodes = [];
    
    return (function clone (src) {
        for (var i = 0; i < parents.length; i++) {
            if (parents[i] === src) {
                return nodes[i];
            }
        }
        
        if (typeof src === 'object' && src !== null) {
            var dst = copy(src);
            
            parents.push(src);
            nodes.push(dst);
            
            forEach(objectKeys(src), function (key) {
                dst[key] = clone(src[key]);
            });
            
            parents.pop();
            nodes.pop();
            return dst;
        }
        else {
            return src;
        }
    })(this.value);
};

function walk (root, cb, immutable) {
    var path = [];
    var parents = [];
    var alive = true;
    
    return (function walker (node_) {
        var node = immutable ? copy(node_) : node_;
        var modifiers = {};
        
        var keepGoing = true;
        
        var state = {
            node : node,
            node_ : node_,
            path : [].concat(path),
            parent : parents[parents.length - 1],
            parents : parents,
            key : path.slice(-1)[0],
            isRoot : path.length === 0,
            level : path.length,
            circular : null,
            update : function (x, stopHere) {
                if (!state.isRoot) {
                    state.parent.node[state.key] = x;
                }
                state.node = x;
                if (stopHere) keepGoing = false;
            },
            'delete' : function (stopHere) {
                delete state.parent.node[state.key];
                if (stopHere) keepGoing = false;
            },
            remove : function (stopHere) {
                if (isArray(state.parent.node)) {
                    state.parent.node.splice(state.key, 1);
                }
                else {
                    delete state.parent.node[state.key];
                }
                if (stopHere) keepGoing = false;
            },
            keys : null,
            before : function (f) { modifiers.before = f },
            after : function (f) { modifiers.after = f },
            pre : function (f) { modifiers.pre = f },
            post : function (f) { modifiers.post = f },
            stop : function () { alive = false },
            block : function () { keepGoing = false }
        };
        
        if (!alive) return state;
        
        function updateState() {
            if (typeof state.node === 'object' && state.node !== null) {
                if (!state.keys || state.node_ !== state.node) {
                    state.keys = objectKeys(state.node)
                }
                
                state.isLeaf = state.keys.length == 0;
                
                for (var i = 0; i < parents.length; i++) {
                    if (parents[i].node_ === node_) {
                        state.circular = parents[i];
                        break;
                    }
                }
            }
            else {
                state.isLeaf = true;
                state.keys = null;
            }
            
            state.notLeaf = !state.isLeaf;
            state.notRoot = !state.isRoot;
        }
        
        updateState();
        
        // use return values to update if defined
        var ret = cb.call(state, state.node);
        if (ret !== undefined && state.update) state.update(ret);
        
        if (modifiers.before) modifiers.before.call(state, state.node);
        
        if (!keepGoing) return state;
        
        if (typeof state.node == 'object'
        && state.node !== null && !state.circular) {
            parents.push(state);
            
            updateState();
            
            forEach(state.keys, function (key, i) {
                path.push(key);
                
                if (modifiers.pre) modifiers.pre.call(state, state.node[key], key);
                
                var child = walker(state.node[key]);
                if (immutable && hasOwnProperty.call(state.node, key)) {
                    state.node[key] = child.node;
                }
                
                child.isLast = i == state.keys.length - 1;
                child.isFirst = i == 0;
                
                if (modifiers.post) modifiers.post.call(state, child);
                
                path.pop();
            });
            parents.pop();
        }
        
        if (modifiers.after) modifiers.after.call(state, state.node);
        
        return state;
    })(root).node;
}

function copy (src) {
    if (typeof src === 'object' && src !== null) {
        var dst;
        
        if (isArray(src)) {
            dst = [];
        }
        else if (isDate(src)) {
            dst = new Date(src.getTime ? src.getTime() : src);
        }
        else if (isRegExp(src)) {
            dst = new RegExp(src);
        }
        else if (isError(src)) {
            dst = { message: src.message };
        }
        else if (isBoolean(src)) {
            dst = new Boolean(src);
        }
        else if (isNumber(src)) {
            dst = new Number(src);
        }
        else if (isString(src)) {
            dst = new String(src);
        }
        else if (Object.create && Object.getPrototypeOf) {
            dst = Object.create(Object.getPrototypeOf(src));
        }
        else if (src.constructor === Object) {
            dst = {};
        }
        else {
            var proto =
                (src.constructor && src.constructor.prototype)
                || src.__proto__
                || {}
            ;
            var T = function () {};
            T.prototype = proto;
            dst = new T;
        }
        
        forEach(objectKeys(src), function (key) {
            dst[key] = src[key];
        });
        return dst;
    }
    else return src;
}

var objectKeys = Object.keys || function keys (obj) {
    var res = [];
    for (var key in obj) res.push(key)
    return res;
};

function toS (obj) { return Object.prototype.toString.call(obj) }
function isDate (obj) { return toS(obj) === '[object Date]' }
function isRegExp (obj) { return toS(obj) === '[object RegExp]' }
function isError (obj) { return toS(obj) === '[object Error]' }
function isBoolean (obj) { return toS(obj) === '[object Boolean]' }
function isNumber (obj) { return toS(obj) === '[object Number]' }
function isString (obj) { return toS(obj) === '[object String]' }

var isArray = Array.isArray || function isArray (xs) {
    return Object.prototype.toString.call(xs) === '[object Array]';
};

var forEach = function (xs, fn) {
    if (xs.forEach) return xs.forEach(fn)
    else for (var i = 0; i < xs.length; i++) {
        fn(xs[i], i, xs);
    }
};

forEach(objectKeys(Traverse.prototype), function (key) {
    traverse[key] = function (obj) {
        var args = [].slice.call(arguments, 1);
        var t = new Traverse(obj);
        return t[key].apply(t, args);
    };
});

var hasOwnProperty = Object.hasOwnProperty || function (obj, key) {
    return key in obj;
};

},{}],18:[function(require,module,exports){
// LICENSE : MIT
"use strict";
/*
    {
        "c": [
            {
                "c": "text",
                "type": "Str"
            }
        ],
        "type": "Emphasis"
    }

    FIXME: we have no way of detect *text* or _text_
 */
module.exports = function (node, contents) {
    return "*" + contents + "*";
};
},{}],19:[function(require,module,exports){
// LICENSE : MIT
"use strict";

/*
    {
            "t": "Code",
            "c": "code",
            "type": "Code"
    }
 */
module.exports = function code(node, contents) {
    return '`' + contents + '`';
};
},{}],20:[function(require,module,exports){
// LICENSE : MIT
"use strict";

/*
    {
        "destination": "http://example.com/a.png",
        "label": [
            {
                "c": "text",
                "type": "Str"
            }
        ],
        "type": "Image"
    }
 */
module.exports = function (node, contennts) {
    return "![" + contennts + "](" + node.destination + ")";
};

},{}],21:[function(require,module,exports){
// LICENSE : MIT
"use strict";
/*
    [label](http://example.com)
    =>
    {
        "destination": "http://example.com",
        "label": [
            {
                // inline_content
            }
        ],
        "raw": "label",
        "type": "Link"
    }


    [label](http://example.com "title")
    =>
    {
        "destination": "http://example.com",
        "title": "title",
        "label": [
            // inline_content
        ],
        "raw": "label",
        "type": "Link"
    }
 */
module.exports = function link(node, contents) {
    if (typeof node.title === "undefined") {
        return '[' + contents + '](' + node.destination + ')';
    } else {
        return '[' + contents + '](' + node.destination + ' "' + node.title + '")';
    }
};
},{}],22:[function(require,module,exports){
// LICENSE : MIT
"use strict";

/*
 {
    "c": [
        {
            "c": "str",
            "type": "Str"
        }
    ],
    "type": "Strong"
    }
 */
module.exports = function (node, contents) {
    return '__' + contents + '__';
};
},{}],23:[function(require,module,exports){
// LICENSE : MIT
"use strict";
// public key interface
var exports = {
    "Document": "Document", // must
    "Paragraph": "Paragraph",
    "BlockQuote": "BlockQuote",
    "ListItem": "ListItem",
    "List": "List",
    "Header": "Header",
    "CodeBlock": "CodeBlock",
    "HtmlBlock": "HtmlBlock",
    "ReferenceDef": "ReferenceDef",
    "HorizontalRule": "HorizontalRule",
    // inline
    'Str': 'Str', // must
    'Break': 'Break', // must
    'Emphasis': 'Emphasis',
    'Strong': 'Strong',
    'Html': 'Html',
    'Link': 'Link',
    'Image': 'Image',
    'Code': 'Code'
};
module.exports = exports;
},{}],24:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],25:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canMutationObserver = typeof window !== 'undefined'
    && window.MutationObserver;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    var queue = [];

    if (canMutationObserver) {
        var hiddenDiv = document.createElement("div");
        var observer = new MutationObserver(function () {
            var queueList = queue.slice();
            queue.length = 0;
            queueList.forEach(function (fn) {
                fn();
            });
        });

        observer.observe(hiddenDiv, { attributes: true });

        return function nextTick(fn) {
            if (!queue.length) {
                hiddenDiv.setAttribute('yes', 'no');
            }
            queue.push(fn);
        };
    }

    if (canPost) {
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],26:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],27:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":26,"_process":25,"inherits":24}]},{},[1]);
