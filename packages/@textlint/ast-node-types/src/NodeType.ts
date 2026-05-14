// ================================================================================
// Node Abstract Syntax Tree
// ================================================================================
/**
 * AST Node types list on TxtNode.
 * Constant value of types
 * @see https://github.com/textlint/textlint/blob/master/docs/txtnode.md
 */
import type { ASTNodeTypes } from "./ASTNodeTypes.js";

/**
 * Key of ASTNodeTypes or any string
 * For example, TxtNodeType is "Document".
 */
export type TxtNodeType = keyof typeof ASTNodeTypes;

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
    readonly line: number; // start with 1
    readonly column: number; // start with 0
};

/**
 * Location
 */
export type TxtNodeLocation = {
    readonly start: TxtNodePosition;
    readonly end: TxtNodePosition;
};

/**
 * Range starts with 0
 */
export type TxtNodeRange = readonly [startIndex: number, endIndex: number];

/**
 * TxtNode is abstract interface of AST Node.
 * Probably, Real TxtNode implementation has more properties.
 */
export interface TxtNode {
    readonly type: TxtNodeType;
    readonly raw: string;
    readonly range: TxtNodeRange;
    readonly loc: TxtNodeLocation;
    // `parent` is created by runtime
    readonly parent?: TxtParentNode;
}

/**
 * Text Node.
 * Text Node has inline value.
 * For example, `Str` Node is an TxtTextNode.
 */
export interface TxtTextNode extends TxtNode {
    readonly value: string;
}

/**
 * Parent Node.
 * Parent Node has children that are consist of TxtParentNode or TxtTextNode
 */
export interface TxtParentNode extends TxtNode {
    readonly children: readonly Content[];
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
export type TopLevelContent = BlockContent;
/**
 * All node types that may be used where markdown block content is accepted.
 * These types are accepted inside block quotes, list items, and roots.
 */
export type BlockContent =
    | TxtParagraphNode
    | TxtHeaderNode
    | TxtHorizontalRuleNode
    | TxtBlockQuoteNode
    | TxtListNode
    | TxtTableNode
    | TxtHtmlNode
    | TxtCodeBlockNode;
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
export type PhrasingContent = TxtLinkNode | StaticPhrasingContent;
/**
 * All node types that are acceptable in a static phrasing context.
 */
export type StaticPhrasingContent =
    | TxtStrNode
    | TxtEmphasisNode
    | TxtStrongNode
    | TxtDeleteNode
    | TxtHtmlNode
    | TxtCodeNode
    | TxtBreakNode
    | TxtImageNode
    | TxtCommentNode;

export interface TxtDocumentNode extends TxtParentNode {
    readonly type: "Document";
}

export interface TxtParagraphNode extends TxtParentNode {
    readonly type: "Paragraph";
    readonly children: readonly PhrasingContent[];
}

export interface TxtHeaderNode extends TxtParentNode {
    readonly type: "Header";
    readonly depth: 1 | 2 | 3 | 4 | 5 | 6;
    readonly children: readonly PhrasingContent[];
}

export interface TxtHorizontalRuleNode extends TxtNode {
    readonly type: "HorizontalRule";
}

export interface TxtBlockQuoteNode extends TxtParentNode {
    readonly type: "BlockQuote";
    readonly children: readonly BlockContent[];
}

export interface TxtListNode extends TxtParentNode {
    readonly type: "List";
    readonly ordered?: boolean | null | undefined;
    readonly start?: number | null | undefined;
    readonly spread?: boolean | null | undefined;
    readonly children: readonly ListContent[];
}

export interface TxtListItemNode extends TxtParentNode {
    readonly type: "ListItem";
    readonly checked?: boolean | null | undefined;
    readonly spread?: boolean | null | undefined;
    readonly children: readonly BlockContent[];
}

export interface TxtTableNode extends TxtParentNode {
    readonly type: "Table";
    readonly align?: readonly AlignType[] | null | undefined;
    readonly children: readonly TableContent[];
}

export interface TxtTableRowNode extends TxtParentNode {
    readonly type: "TableRow";
    readonly children: readonly RowContent[];
}

export interface TxtTableCellNode extends TxtParentNode {
    readonly type: "TableCell";
    readonly children: readonly PhrasingContent[];
}

export interface TxtHtmlNode extends TxtTextNode {
    readonly type: "Html";
}

export interface TxtCommentNode extends TxtTextNode {
    readonly type: "Comment";
}

export interface TxtCodeBlockNode extends TxtTextNode {
    readonly type: "CodeBlock";
    readonly lang?: string | null | undefined;
    readonly meta?: string | null | undefined;
}

export interface TxtStrNode extends TxtTextNode {
    readonly type: "Str";
}

export interface TxtEmphasisNode extends TxtParentNode {
    readonly type: "Emphasis";
    readonly children: readonly PhrasingContent[];
}

export interface TxtStrongNode extends TxtParentNode {
    readonly type: "Strong";
    readonly children: readonly PhrasingContent[];
}

export interface TxtDeleteNode extends TxtParentNode {
    readonly type: "Delete";
    readonly children: readonly PhrasingContent[];
}

// Inline Code
export interface TxtCodeNode extends TxtTextNode {
    readonly type: "Code";
}

export interface TxtBreakNode extends TxtNode {
    readonly type: "Break";
}

export interface TxtLinkNode extends TxtParentNode, TxtResource {
    readonly type: "Link";
    readonly children: readonly StaticPhrasingContent[];
}

export interface TxtLinkReferenceNode extends TxtParentNode, TxtReference {
    readonly type: "LinkReference";
    readonly children: readonly StaticPhrasingContent[];
    readonly referenceType: ReferenceType;
}

export interface TxtImageNode extends TxtNode, TxtResource, TxtAlternative {
    readonly type: "Image";
}

export interface TxtImageReferenceNode extends TxtNode, TxtAlternative, TxtReference {
    readonly type: "ImageReference";
    readonly referenceType: ReferenceType;
}

export interface TxtDefinitionNode extends TxtNode, TxtResource, TxtReference {
    readonly type: "Definition";
}

// Mixin
export interface TxtResource {
    readonly url: string;
    readonly title?: string | null | undefined;
}

export interface TxtAlternative {
    readonly alt?: string | null | undefined;
}

export interface TxtReference {
    readonly identifier: string;
    readonly label: string;
}
