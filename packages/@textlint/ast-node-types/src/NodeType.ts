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
 * A position in the document text.
 * `line` starts with 1, and `column` starts with 0 and counts UTF-16 code units.
 * The character after a line ending is at column 0 of the next line.
 * This is for compatibility with JavaScript AST.
 * https://gist.github.com/azu/8866b2cb9b7a933e01fe
 */
export type TxtNodePosition = {
    readonly line: number; // start with 1
    readonly column: number; // start with 0
};

/**
 * Location.
 * `start` is the position of `range[0]`, and `end` is the position of `range[1]`.
 */
export type TxtNodeLocation = {
    readonly start: TxtNodePosition;
    readonly end: TxtNodePosition;
};

/**
 * Range is a pair of offsets in the document text.
 * `startIndex` is inclusive and `endIndex` is exclusive.
 * Offsets start with 0 and count UTF-16 code units.
 */
export type TxtNodeRange = readonly [startIndex: number, endIndex: number];

/**
 * TxtNode is abstract interface of AST Node.
 * Probably, Real TxtNode implementation has more properties.
 *
 * These type definitions are the definition of the generic nodes of TxtAST.
 * A property marked as optional with `?` may be absent, `undefined`, or `null`.
 * Every other property is required in every format.
 */
export interface TxtNode {
    /**
     * Name of the node type.
     * A generic node type is PascalCase. A node type that a format adds starts with a lowercase letter.
     */
    readonly type: TxtNodeType;
    /**
     * Source text of the node. It is the document text from `range[0]` to `range[1]`.
     */
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
    /**
     * Content of the node without the markup, so it may differ from `raw`.
     * Each text node type states what `value` holds.
     */
    readonly value: string;
}

/**
 * Parent Node.
 * Parent Node has children that are consist of TxtParentNode or TxtTextNode
 */
export interface TxtParentNode extends TxtNode {
    /**
     * Child nodes in the source order. It may be empty.
     */
    readonly children: readonly Content[];
}

// ================================================================================
// Node types
// ================================================================================
/**
 * Alignment of a table column. `null` means that the column has no alignment.
 */
export type AlignType = "left" | "right" | "center" | null;
/**
 * How a reference points to its `Definition`.
 * In Markdown, `[text][label]` is "full", `[label][]` is "collapsed", and `[label]` is "shortcut".
 */
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

/**
 * The whole document. It is the root of the AST.
 */
export interface TxtDocumentNode extends TxtParentNode {
    readonly type: "Document";
}

/**
 * A paragraph.
 */
export interface TxtParagraphNode extends TxtParentNode {
    readonly type: "Paragraph";
    readonly children: readonly PhrasingContent[];
}

/**
 * A heading.
 */
export interface TxtHeaderNode extends TxtParentNode {
    readonly type: "Header";
    /**
     * Level of the heading. 1 is the top level.
     */
    readonly depth: 1 | 2 | 3 | 4 | 5 | 6;
    readonly children: readonly PhrasingContent[];
}

/**
 * A thematic break.
 */
export interface TxtHorizontalRuleNode extends TxtNode {
    readonly type: "HorizontalRule";
}

/**
 * A quotation of blocks.
 */
export interface TxtBlockQuoteNode extends TxtParentNode {
    readonly type: "BlockQuote";
    readonly children: readonly BlockContent[];
}

/**
 * A list. Its children are `ListItem`.
 */
export interface TxtListNode extends TxtParentNode {
    readonly type: "List";
    /**
     * Whether the items are ordered.
     */
    readonly ordered?: boolean | null | undefined;
    /**
     * Number of the first item of an ordered list.
     */
    readonly start?: number | null | undefined;
    /**
     * Whether any of the items are separated by blank lines.
     */
    readonly spread?: boolean | null | undefined;
    readonly children: readonly ListContent[];
}

/**
 * An item of a list.
 */
export interface TxtListItemNode extends TxtParentNode {
    readonly type: "ListItem";
    /**
     * `true` or `false` for a task list item. `null` or absent for other items.
     */
    readonly checked?: boolean | null | undefined;
    /**
     * Whether the item contains blocks separated by blank lines.
     */
    readonly spread?: boolean | null | undefined;
    readonly children: readonly BlockContent[];
}

/**
 * A table. Its children are `TableRow`.
 */
export interface TxtTableNode extends TxtParentNode {
    readonly type: "Table";
    /**
     * Alignment of each column.
     */
    readonly align?: readonly AlignType[] | null | undefined;
    readonly children: readonly TableContent[];
}

/**
 * A row of a table. Its children are `TableCell`.
 */
export interface TxtTableRowNode extends TxtParentNode {
    readonly type: "TableRow";
    readonly children: readonly RowContent[];
}

/**
 * A cell of a table.
 */
export interface TxtTableCellNode extends TxtParentNode {
    readonly type: "TableCell";
    readonly children: readonly PhrasingContent[];
}

/**
 * Raw HTML, as a block or inline. `value` is the HTML.
 */
export interface TxtHtmlNode extends TxtTextNode {
    readonly type: "Html";
}

/**
 * A comment of the format. `value` is the content of the comment.
 */
export interface TxtCommentNode extends TxtTextNode {
    readonly type: "Comment";
}

/**
 * A block of code. `value` is the code.
 */
export interface TxtCodeBlockNode extends TxtTextNode {
    readonly type: "CodeBlock";
    /**
     * Language of the code.
     */
    readonly lang?: string | null | undefined;
    /**
     * Additional information that follows the language.
     */
    readonly meta?: string | null | undefined;
}

/**
 * Prose. `value` is the text that rules check.
 * Markup becomes other nodes, and a parser does not split `Str` into sentences or words.
 */
export interface TxtStrNode extends TxtTextNode {
    readonly type: "Str";
}

/**
 * Emphasis.
 */
export interface TxtEmphasisNode extends TxtParentNode {
    readonly type: "Emphasis";
    readonly children: readonly PhrasingContent[];
}

/**
 * Strong emphasis.
 */
export interface TxtStrongNode extends TxtParentNode {
    readonly type: "Strong";
    readonly children: readonly PhrasingContent[];
}

/**
 * Deleted text.
 */
export interface TxtDeleteNode extends TxtParentNode {
    readonly type: "Delete";
    readonly children: readonly PhrasingContent[];
}

/**
 * Inline code. `value` is the code.
 */
export interface TxtCodeNode extends TxtTextNode {
    readonly type: "Code";
}

/**
 * A hard line break.
 */
export interface TxtBreakNode extends TxtNode {
    readonly type: "Break";
}

/**
 * A link.
 */
export interface TxtLinkNode extends TxtParentNode, TxtResource {
    readonly type: "Link";
    readonly children: readonly StaticPhrasingContent[];
}

/**
 * A link that points to a `Definition`.
 */
export interface TxtLinkReferenceNode extends TxtParentNode, TxtReference {
    readonly type: "LinkReference";
    readonly children: readonly StaticPhrasingContent[];
    /**
     * How the reference is written.
     */
    readonly referenceType: ReferenceType;
}

/**
 * An image.
 */
export interface TxtImageNode extends TxtNode, TxtResource, TxtAlternative {
    readonly type: "Image";
}

/**
 * An image that points to a `Definition`.
 */
export interface TxtImageReferenceNode extends TxtNode, TxtAlternative, TxtReference {
    readonly type: "ImageReference";
    /**
     * How the reference is written.
     */
    readonly referenceType: ReferenceType;
}

/**
 * A definition that a reference points to.
 */
export interface TxtDefinitionNode extends TxtNode, TxtResource, TxtReference {
    readonly type: "Definition";
}

// Mixin
/**
 * A node that refers to a resource.
 */
export interface TxtResource {
    /**
     * Location of the resource.
     */
    readonly url: string;
    /**
     * Title of the resource.
     */
    readonly title?: string | null | undefined;
}

/**
 * A node that has an alternative text.
 */
export interface TxtAlternative {
    /**
     * Text that describes the image.
     */
    readonly alt?: string | null | undefined;
}

/**
 * A node that is matched with another node by an identifier.
 */
export interface TxtReference {
    /**
     * Normalized form of `label`. A reference and its `Definition` have the same `identifier`.
     */
    readonly identifier: string;
    /**
     * Label as written in the document.
     */
    readonly label: string;
}
