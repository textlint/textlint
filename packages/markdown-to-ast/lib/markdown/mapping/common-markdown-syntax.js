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