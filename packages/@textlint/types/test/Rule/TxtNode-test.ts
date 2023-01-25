// Node type test
import {
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
    TxtCodeNode,
    TxtImageNode,
    TxtLinkNode,
    TxtListItemNode,
    TxtListNode,
    TxtParagraphNode,
    TxtStrNode,
    TxtStrongNode,
} from "@textlint/ast-node-types";
import { TextlintRuleReporter } from "../../src/index";

const noop = (..._args: any[]) => {};
export const expectType = <Type>(_: Type): void => void 0;
const report: TextlintRuleReporter = (context) => {
    const { Syntax } = context;
    return {
        [Syntax.Document](node) {
            expectType<TxtDocumentNode>(node);
        },
        [Syntax.DocumentExit](node) {
            expectType<TxtDocumentNode>(node);
        },
        [Syntax.Paragraph](node) {
            expectType<TxtParagraphNode>(node);
        },
        [Syntax.ParagraphExit](node) {
            expectType<TxtParagraphNode>(node);
        },
        [Syntax.BlockQuote](node) {
            expectType<TxtBlockQuoteNode>(node);
        },
        [Syntax.BlockQuoteExit](node) {
            expectType<TxtBlockQuoteNode>(node);
        },
        [Syntax.List](node) {
            expectType<TxtListNode>(node);
        },
        [Syntax.ListExit](node) {
            expectType<TxtListNode>(node);
        },
        [Syntax.ListItem](node) {
            expectType<TxtListItemNode>(node);
        },
        [Syntax.ListItemExit](node) {
            expectType<TxtListItemNode>(node);
        },
        [Syntax.Header](node) {
            expectType<TxtHeaderNode>(node);
        },
        [Syntax.HeaderExit](node) {
            expectType<TxtHeaderNode>(node);
        },
        [Syntax.CodeBlock](node) {
            expectType<TxtCodeBlockNode>(node);
        },
        [Syntax.CodeBlockExit](node) {
            expectType<TxtCodeBlockNode>(node);
        },
        [Syntax.Link](node) {
            expectType<TxtLinkNode>(node);
        },
        [Syntax.LinkExit](node) {
            expectType<TxtLinkNode>(node);
        },
        [Syntax.Delete](node) {
            expectType<TxtDeleteNode>(node);
        },
        [Syntax.DeleteExit](node) {
            expectType<TxtDeleteNode>(node);
        },
        [Syntax.Emphasis](node) {
            expectType<TxtEmphasisNode>(node);
        },
        [Syntax.EmphasisExit](node) {
            expectType<TxtEmphasisNode>(node);
        },
        [Syntax.Strong](node) {
            expectType<TxtStrongNode>(node);
        },
        [Syntax.StrongExit](node) {
            expectType<TxtStrongNode>(node);
        },
        [Syntax.Break](node) {
            expectType<TxtBreakNode>(node);
        },
        [Syntax.BreakExit](node) {
            expectType<TxtBreakNode>(node);
        },
        [Syntax.Image](node) {
            expectType<TxtImageNode>(node);
        },
        [Syntax.ImageExit](node) {
            expectType<TxtImageNode>(node);
        },
        [Syntax.HorizontalRule](node) {
            expectType<TxtHorizontalRuleNode>(node);
        },
        [Syntax.HorizontalRuleExit](node) {
            expectType<TxtHorizontalRuleNode>(node);
        },
        [Syntax.Comment](node) {
            expectType<TxtCommentNode>(node);
        },
        [Syntax.CommentExit](node) {
            expectType<TxtCommentNode>(node);
        },
        [Syntax.Str](node) {
            expectType<TxtStrNode>(node);
        },
        [Syntax.StrExit](node) {
            expectType<TxtStrNode>(node);
        },
        [Syntax.Code](node) {
            expectType<TxtCodeNode>(node);
        },
        [Syntax.CodeExit](node) {
            expectType<TxtCodeNode>(node);
        },
        [Syntax.Html](node) {
            expectType<TxtHtmlNode>(node);
        },
        [Syntax.HtmlExit](node) {
            expectType<TxtHtmlNode>(node);
        },
    };
};
noop(report);
