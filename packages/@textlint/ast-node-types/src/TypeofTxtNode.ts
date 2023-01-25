import type { ASTNodeTypes } from "./ASTNodeTypes";
import type {
    AnyTxtNode,
    TxtBlockquoteNode,
    TxtBreakNode,
    TxtCodeBlockNode,
    TxtCommentNode,
    TxtDeleteNode,
    TxtDocumentNode,
    TxtEmphasisNode,
    TxtHeaderNode,
    TxtHorizontalRuleNode,
    TxtHtmlNode,
    TxtImageNode,
    TxtLinkNode,
    TxtListItemNode,
    TxtListNode,
    TxtParagraphNode,
    TxtStrNode,
    TxtStrongNode,
    TxtTableCellNode,
    TxtTableNode,
    TxtTableRowNode
} from "./NodeType";

/**
 * Type utility for TxtNodeType
 * Return TxtNode interface for the TxtNodeTYpe
 *
 * @example
 * ```ts
 * type NodeType = TxtNodeTypeOfNode<ASTNodeTypes.Document>;
 * ```
 */
export type TypeofTxtNode<T extends ASTNodeTypes | string> =
    // Root
    T extends ASTNodeTypes.Document
        ? TxtDocumentNode
        : T extends ASTNodeTypes.DocumentExit
        ? TxtDocumentNode // Paragraph Str.
        : T extends ASTNodeTypes.Paragraph
        ? TxtParagraphNode
        : T extends ASTNodeTypes.ParagraphExit
        ? TxtParagraphNode // > Str
        : T extends ASTNodeTypes.BlockQuote
        ? TxtBlockquoteNode
        : T extends ASTNodeTypes.BlockQuoteExit
        ? TxtBlockquoteNode // - item
        : T extends ASTNodeTypes.List
        ? TxtListNode
        : T extends ASTNodeTypes.ListExit
        ? TxtListNode // - item
        : T extends ASTNodeTypes.ListItem
        ? TxtListItemNode
        : T extends ASTNodeTypes.ListItemExit
        ? TxtListItemNode // # Str
        : T extends ASTNodeTypes.Header
        ? TxtHeaderNode
        : T extends ASTNodeTypes.HeaderExit
        ? TxtHeaderNode
        : /* ```
         * code block
         * ```
         */
        T extends ASTNodeTypes.CodeBlock
        ? TxtCodeBlockNode
        : T extends ASTNodeTypes.CodeBlockExit
        ? TxtCodeBlockNode // <div>\n</div>
        : T extends ASTNodeTypes.HtmlBlock
        ? TxtHtmlNode
        : T extends ASTNodeTypes.HtmlBlockExit
        ? TxtHtmlNode // [link](https://example.com)
        : T extends ASTNodeTypes.Link
        ? TxtLinkNode
        : T extends ASTNodeTypes.LinkExit
        ? TxtLinkNode // ~~Str~~
        : T extends ASTNodeTypes.Delete
        ? TxtDeleteNode
        : T extends ASTNodeTypes.DeleteExit
        ? TxtDeleteNode // *Str*
        : T extends ASTNodeTypes.Emphasis
        ? TxtEmphasisNode
        : T extends ASTNodeTypes.EmphasisExit
        ? TxtEmphasisNode // __Str__
        : T extends ASTNodeTypes.Strong
        ? TxtStrongNode
        : T extends ASTNodeTypes.StrongExit
        ? TxtStrongNode // Str<space><space>
        : T extends ASTNodeTypes.Break
        ? TxtBreakNode
        : T extends ASTNodeTypes.BreakExit
        ? TxtBreakNode // ![alt](https://example.com/img)
        : T extends ASTNodeTypes.Image
        ? TxtImageNode
        : T extends ASTNodeTypes.ImageExit
        ? TxtImageNode // ----
        : T extends ASTNodeTypes.HorizontalRule
        ? TxtHorizontalRuleNode
        : T extends ASTNodeTypes.HorizontalRuleExit
        ? TxtHorizontalRuleNode // <!-- Str -->
        : T extends ASTNodeTypes.Comment
        ? TxtCommentNode
        : T extends ASTNodeTypes.CommentExit
        ? TxtCommentNode // Str
        : T extends ASTNodeTypes.Str
        ? TxtStrNode
        : T extends ASTNodeTypes.StrExit
        ? TxtStrNode // `code`
        : T extends ASTNodeTypes.Code
        ? TxtCodeBlockNode
        : T extends ASTNodeTypes.CodeExit
        ? TxtCodeBlockNode // <span>Str</span>
        : T extends ASTNodeTypes.Html
        ? TxtHtmlNode
        : T extends ASTNodeTypes.HtmlExit
        ? TxtHtmlNode
        : T extends ASTNodeTypes.Table
        ? TxtTableNode
        : T extends ASTNodeTypes.TableExit
        ? TxtTableNode
        : T extends ASTNodeTypes.TableRow
        ? TxtTableRowNode
        : T extends ASTNodeTypes.TableRowExit
        ? TxtTableRowNode
        : T extends ASTNodeTypes.TableCell
        ? TxtTableCellNode
        : T extends ASTNodeTypes.TableCellExit
        ? TxtTableCellNode
        : AnyTxtNode;
