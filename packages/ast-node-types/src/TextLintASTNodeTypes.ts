// MIT © 2017 azu
"use strict";
/**
 * AST Node types list on TxtNode.
 * @see https://github.com/textlint/textlint/blob/master/docs/txtnode.md
 */
export const ASTNodeTypes = {
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
    "Comment": "Comment",
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
