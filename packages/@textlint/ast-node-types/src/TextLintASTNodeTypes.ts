// MIT © 2017 azu
"use strict";
/**
 * AST Node types list on TxtNode.
 * Constant value of types
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
/**
 * Key of TxtNode type
 * Union Types
 */
export type TxtNodeType = keyof typeof ASTNodeTypes;

/**
 * Basic TxtNode
 */
export interface TxtNode {
    type: TxtNodeType | string;
    raw: string;
    range: TextNodeRange;
    loc: TxtNodeLineLocation;
    // parent is runtime information
    // Not need in AST
    parent?: TxtNode;
}

/**
 * Inline Text Node.
 * For example, Str Node.
 */
export interface TxtTextNode extends TxtNode {
    value: string;
}

/**
 * Parent Node.
 * For example, Paragraph Node
 */
export interface TxtParentNode extends TxtNode {
    children: TxtNode[] | TxtTextNode[];
}

/**
 * Root Node.
 * Root Node is only one in the document.
 * In other words, Root Node is Document Node.
 */
export interface TxtRootNode extends TxtNode {
    type: "Document";
    children: TxtNode[];
}

/**
 * Location
 */
export interface TxtNodeLineLocation {
    start: TxtNodePosition;
    end: TxtNodePosition;
}

/**
 * Position's line start with 1.
 * Position's column start with 0.
 * This is for compatibility with JavaScript AST.
 * https://gist.github.com/azu/8866b2cb9b7a933e01fe
 */
export interface TxtNodePosition {
    line: number; // start with 1
    column: number; // start with 0
}

/**
 * Range start with 0
 */
export type TextNodeRange = [number, number];
