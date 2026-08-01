import type { ASTNodeTypes } from "./ASTNodeTypes.js";
import type {
    AnyTxtNode,
    TxtBlockQuoteNode,
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
    TxtImageReferenceNode,
    TxtDefinitionNode,
    TxtCodeNode,
    TxtLinkNode,
    TxtLinkReferenceNode,
    TxtListItemNode,
    TxtListNode,
    TxtParagraphNode,
    TxtStrNode,
    TxtStrongNode,
    TxtTableCellNode,
    TxtTableNode,
    TxtTableRowNode
} from "./NodeType.js";

/**
 * Mapping from ASTNodeTypes (enter/exit) to the corresponding TxtNode interface.
 */
interface TxtNodeTypeMap {
    [ASTNodeTypes.Document]: TxtDocumentNode;
    [ASTNodeTypes.DocumentExit]: TxtDocumentNode;
    [ASTNodeTypes.Paragraph]: TxtParagraphNode;
    [ASTNodeTypes.ParagraphExit]: TxtParagraphNode;
    [ASTNodeTypes.BlockQuote]: TxtBlockQuoteNode;
    [ASTNodeTypes.BlockQuoteExit]: TxtBlockQuoteNode;
    [ASTNodeTypes.List]: TxtListNode;
    [ASTNodeTypes.ListExit]: TxtListNode;
    [ASTNodeTypes.ListItem]: TxtListItemNode;
    [ASTNodeTypes.ListItemExit]: TxtListItemNode;
    [ASTNodeTypes.Header]: TxtHeaderNode;
    [ASTNodeTypes.HeaderExit]: TxtHeaderNode;
    [ASTNodeTypes.CodeBlock]: TxtCodeBlockNode;
    [ASTNodeTypes.CodeBlockExit]: TxtCodeBlockNode;
    [ASTNodeTypes.HtmlBlock]: TxtHtmlNode;
    [ASTNodeTypes.HtmlBlockExit]: TxtHtmlNode;
    [ASTNodeTypes.Link]: TxtLinkNode;
    [ASTNodeTypes.LinkExit]: TxtLinkNode;
    [ASTNodeTypes.LinkReference]: TxtLinkReferenceNode;
    [ASTNodeTypes.LinkReferenceExit]: TxtLinkReferenceNode;
    [ASTNodeTypes.Delete]: TxtDeleteNode;
    [ASTNodeTypes.DeleteExit]: TxtDeleteNode;
    [ASTNodeTypes.Emphasis]: TxtEmphasisNode;
    [ASTNodeTypes.EmphasisExit]: TxtEmphasisNode;
    [ASTNodeTypes.Strong]: TxtStrongNode;
    [ASTNodeTypes.StrongExit]: TxtStrongNode;
    [ASTNodeTypes.Break]: TxtBreakNode;
    [ASTNodeTypes.BreakExit]: TxtBreakNode;
    [ASTNodeTypes.Image]: TxtImageNode;
    [ASTNodeTypes.ImageExit]: TxtImageNode;
    [ASTNodeTypes.ImageReference]: TxtImageReferenceNode;
    [ASTNodeTypes.ImageReferenceExit]: TxtImageReferenceNode;
    [ASTNodeTypes.Definition]: TxtDefinitionNode;
    [ASTNodeTypes.DefinitionExit]: TxtDefinitionNode;
    [ASTNodeTypes.HorizontalRule]: TxtHorizontalRuleNode;
    [ASTNodeTypes.HorizontalRuleExit]: TxtHorizontalRuleNode;
    [ASTNodeTypes.Comment]: TxtCommentNode;
    [ASTNodeTypes.CommentExit]: TxtCommentNode;
    [ASTNodeTypes.Str]: TxtStrNode;
    [ASTNodeTypes.StrExit]: TxtStrNode;
    [ASTNodeTypes.Code]: TxtCodeNode;
    [ASTNodeTypes.CodeExit]: TxtCodeNode;
    [ASTNodeTypes.Html]: TxtHtmlNode;
    [ASTNodeTypes.HtmlExit]: TxtHtmlNode;
    [ASTNodeTypes.Table]: TxtTableNode;
    [ASTNodeTypes.TableExit]: TxtTableNode;
    [ASTNodeTypes.TableRow]: TxtTableRowNode;
    [ASTNodeTypes.TableRowExit]: TxtTableRowNode;
    [ASTNodeTypes.TableCell]: TxtTableCellNode;
    [ASTNodeTypes.TableCellExit]: TxtTableCellNode;
}

/**
 * Type utility for TxtNodeType
 * Return TxtNode interface for the TxtNodeType
 *
 * @example
 * ```ts
 * type NodeType = TypeofTxtNode<ASTNodeTypes.Document>;
 * ```
 */
export type TypeofTxtNode<T extends ASTNodeTypes | string> = T extends keyof TxtNodeTypeMap
    ? TxtNodeTypeMap[T]
    : AnyTxtNode;
