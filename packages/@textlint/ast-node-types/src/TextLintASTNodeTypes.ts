// MIT © 2017 azu
"use strict";
/**
 * AST Node types list on TxtNode.
 * @see https://github.com/textlint/textlint/blob/master/docs/txtnode.md
 */
export const ASTNodeTypes = {
    Document: "Document",
    Paragraph: "Paragraph",
    BlockQuote: "BlockQuote",
    ListItem: "ListItem",
    List: "List",
    Header: "Header",
    CodeBlock: "CodeBlock",
    HtmlBlock: "HtmlBlock",
    ReferenceDef: "ReferenceDef",
    HorizontalRule: "HorizontalRule",
    Comment: "Comment",
    // inline
    Str: "Str",
    Break: "Break", // well-known Hard Break
    Emphasis: "Emphasis",
    Strong: "Strong",
    Html: "Html",
    Link: "Link",
    Image: "Image",
    Code: "Code",
    Delete: "Delete"
};

// TextLint AST Node
export interface TxtNode {
    type: keyof typeof ASTNodeTypes | string;
    raw: string;
    range: [number, number];
    loc: TxtNodeLineLocation;
    // parent is runtime information
    // Not need in AST
    parent?: TxtNode;
}

// Inline Node
export interface TxtTextNode extends TxtNode {
    value: string;
}

// Parent Node
export interface TxtParentNode extends TxtNode {
    children: TxtNode[] | TxtTextNode[];
}

export interface TxtRootNode extends TxtNode {
    type: "Document";
    children: TxtNode[];
}

export interface TxtNodeLineLocation {
    start: TxtNodePosition;
    end: TxtNodePosition;
}

export interface TxtNodePosition {
    line: number; // start with 1
    column: number; // start with 0
    // This is for compatibility with JavaScript AST.
    // https://gist.github.com/azu/8866b2cb9b7a933e01fe
}
