// LICENSE : MIT
"use strict";
/**
 * @typedef {{Document: string, Paragraph: string, BlockQuote: string, ListItem: string, List: string, Header: string, CodeBlock: string, HtmlBlock: string, ReferenceDef: string, HorizontalRule: string, Str: string, Break: string, Emphasis: string, Strong: string, Html: string, Link: string, Image: string, Code: string}} TextLintNodeTypes
 */
const NodeSyntax = {
    "Document": "Document",
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
    "Str": "Str",
    "Break": "Break", // well-known Hard Break
    "Emphasis": "Emphasis",
    "Strong": "Strong",
    "Html": "Html",
    "Link": "Link",
    "Image": "Image",
    "Code": "Code"
};
export default NodeSyntax;
