// ================================================================================
// Node Abstract Syntax Tree
// ================================================================================
/**
 * AST Node types list on TxtNode.
 * Constant value of types
 * @see https://github.com/textlint/textlint/blob/master/docs/txtnode.md
 */
import type { ASTNodeTypes } from "./ASTNodeTypes";

/**
 * Key of ASTNodeTypes or any string
 * For example, TxtNodeType is "Document".
 */
export type TxtNodeType = keyof typeof ASTNodeTypes | string;

/**
 * Any TxtNode types
 */
export type AnyTxtNode = TxtNode | TxtTextNode | TxtParentNode;

/**
 * Position's line start with 1.
 * Position's column start with 0.
 * This is for compatibility with JavaScript AST.
 * https://gist.github.com/azu/8866b2cb9b7a933e01fe
 */
export type TxtNodePosition = {
    line: number; // start with 1
    column: number; // start with 0
};

/**
 * Location
 */
export type TxtNodeLineLocation = {
    start: TxtNodePosition;
    end: TxtNodePosition;
};

/**
 * Range starts with 0
 */
export type TextNodeRange = readonly [startIndex: number, endIndex: number];

/**
 * TxtNode is abstract interface of AST Node.
 * Probably, Real TxtNode implementation has more properties.
 */
export interface TxtNode {
    type: TxtNodeType;
    raw: string;
    range: TextNodeRange;
    loc: TxtNodeLineLocation;
    // parent is runtime information
    // Not need in AST
    // For example, top Root Node like `Document` has not parent.
    parent?: TxtNode;

    [index: string]: any;
}

/**
 * Text Node.
 * Text Node has inline value.
 * For example, `Str` Node is an TxtTextNode.
 */
export interface TxtTextNode extends TxtNode {
    value: string;
}

/**
 * Parent Node.
 * Parent Node has children that are consist of TxtParentNode or TxtTextNode
 */
export interface TxtParentNode extends TxtNode {
    children: Content[];
}

// ================================================================================
// Node types
// ================================================================================
export type AlignType = "left" | "right" | "center" | null;
export type ReferenceType = "shortcut" | "collapsed" | "full";

export type Content = TopLevelContent | ListContent | TableContent | RowContent | PhrasingContent;

/**
 * All node definition types.
 */
export type TopLevelContent = BlockContent | DefinitionContent;
/**
 * All node types that may be used where markdown block content is accepted.
 * These types are accepted inside block quotes, list items, footnotes, and roots.
 */
export type BlockContent =
    | TxtParagraphNode
    | TxtHeaderNode
    | TxtHorizontalRuleNode
    | TxtBlockquoteNode
    | TxtListNode
    | TxtTableNode
    | TxtHtmlNode
    | TxtCodeBlockNode;

export type DefinitionContent = TxtDefinitionNode | TxtFootnoteDefinitionNode;
/**
 * All node types that are acceptable inside lists.
 */
export type ListContent = TxtListItemNode;
/**
 * All node types that are acceptable inside tables (not table cells).
 */
export type TableContent = TxtTableRowNode;
/**
 * All node types that are acceptable inside tables rows (not table cells)
 */
export type RowContent = TxtTableCellNode;
/**
 * All node types that are acceptable in a (interactive) phrasing context (so not in links).
 */
export type PhrasingContent = TxtLinkNode | TxtLinkReferenceNode | StaticPhrasingContent;
/**
 * All node types that are acceptable in a static phrasing context.
 */
export type StaticPhrasingContent =
    | TxtStrNode
    | TxtEmphasisNode
    | TxtStrongNode
    | TxtDeleteNode
    | TxtHtmlNode
    | TxtInlineCodeNode
    | TxtBreakNode
    | TxtImageNode
    | TxtImageReferenceNode
    | TxtFootnoteNode
    | TxtFootnoteReferenceNode;

export interface TxtDocumentNode extends TxtParentNode {
    type: "Document";
}

export interface TxtParagraphNode extends TxtParentNode {
    type: "Paragraph";
    children: PhrasingContent[];
}

export interface TxtHeaderNode extends TxtParentNode {
    type: "Header";
    depth: 1 | 2 | 3 | 4 | 5 | 6;
    children: PhrasingContent[];
}

export interface TxtHorizontalRuleNode extends TxtNode {
    type: "HorizontalRule";
}

export interface TxtBlockquoteNode extends TxtParentNode {
    type: "Blockquote";
    children: Array<BlockContent | DefinitionContent>;
}

export interface TxtListNode extends TxtParentNode {
    type: "List";
    ordered?: boolean | null | undefined;
    start?: number | null | undefined;
    spread?: boolean | null | undefined;
    children: ListContent[];
}

export interface TxtListItemNode extends TxtParentNode {
    type: "ListItem";
    checked?: boolean | null | undefined;
    spread?: boolean | null | undefined;
    children: (BlockContent | DefinitionContent)[];
}

export interface TxtTableNode extends TxtParentNode {
    type: "Table";
    align?: AlignType[] | null | undefined;
    children: TableContent[];
}

export interface TxtTableRowNode extends TxtParentNode {
    type: "TableRow";
    children: RowContent[];
}

export interface TxtTableCellNode extends TxtParentNode {
    type: "TableCell";
    children: PhrasingContent[];
}

export interface TxtHtmlNode extends TxtTextNode {
    type: "Html";
}

export interface TxtCommentNode extends TxtTextNode {
    type: "Comment";
}

export interface TxtCodeBlockNode extends TxtTextNode {
    type: "CodeBlock";
    lang?: string | null | undefined;
    meta?: string | null | undefined;
}

export interface TxtDefinitionNode extends Node, TxtAssociation, TxtResource {
    type: "Definition";
}

export interface TxtFootnoteDefinitionNode extends TxtParentNode, TxtAssociation {
    type: "FootnoteDefinition";
    children: (BlockContent | DefinitionContent)[];
}

export interface TxtStrNode extends TxtTextNode {
    type: "Str";
}

export interface TxtEmphasisNode extends TxtParentNode {
    type: "Emphasis";
    children: PhrasingContent[];
}

export interface TxtStrongNode extends TxtParentNode {
    type: "Strong";
    children: PhrasingContent[];
}

export interface TxtDeleteNode extends TxtParentNode {
    type: "Delete";
    children: PhrasingContent[];
}

export interface TxtInlineCodeNode extends TxtTextNode {
    type: "InlineCode";
}

export interface TxtBreakNode extends TxtNode {
    type: "Break";
}

export interface TxtLinkNode extends TxtParentNode, TxtResource {
    type: "link";
    children: StaticPhrasingContent[];
}

export interface TxtImageNode extends Node, TxtResource, TxtAlternative {
    type: "Image";
}

export interface TxtLinkReferenceNode extends TxtParentNode, TxtReference {
    type: "LinkReference";
    children: StaticPhrasingContent[];
}

export interface TxtImageReferenceNode extends Node, TxtReference, TxtAlternative {
    type: "ImageReference";
}

export interface TxtFootnoteNode extends TxtParentNode {
    type: "Footnote";
    children: PhrasingContent[];
}

export interface TxtFootnoteReferenceNode extends Node, TxtAssociation {
    type: "FootnoteReference";
}

// Mixin
export interface TxtResource {
    url: string;
    title?: string | null | undefined;
}

export interface TxtAssociation {
    identifier: string;
    label?: string | null | undefined;
}

export interface TxtReference extends TxtAssociation {
    referenceType: ReferenceType;
}

export interface TxtAlternative {
    alt?: string | null | undefined;
}

// ================================================================================
// Markdown extension
// It is not part of the original markdown spec, but textlint does not support it officially.
// https://www.npmjs.com/package/@types/mdast
// ================================================================================
export interface TxtYAMLNode extends TxtTextNode {
    type: "Yaml";
}
