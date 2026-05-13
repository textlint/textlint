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
    TxtImageReferenceNode,
    TxtDefinitionNode,
    TxtLinkNode,
    TxtLinkReferenceNode,
    TxtListItemNode,
    TxtListNode,
    TxtParagraphNode,
    TxtStrNode,
    TxtStrongNode,
} from "@textlint/ast-node-types";
import { TxtTableCellNode, TxtTableNode, TxtTableRowNode } from "@textlint/ast-node-types/lib/src/NodeType";
import { TextlintRuleReporter } from "../../src/index.js";

const noop = (..._args: unknown[]) => {};
export const expectType = <Type>(_: Type): void => void 0;
// Test: each node type match to AST node type
const report: TextlintRuleReporter = (context) => {
    const { Syntax } = context;
    return {
        [Syntax.Document](node) {
            expectType<TxtDocumentNode>(node);
            // @ts-expect-error TxtNode should be readonly
            node.type = "Paragraph";
            // @ts-expect-error TxtNode should be readonly
            node.raw = "";
            // @ts-expect-error TxtNode should be readonly
            node.range = [0, 0];
            // @ts-expect-error TxtNode should be readonly
            node.loc = {
                start: { line: 1, column: 0 },
                end: { line: 1, column: 1 },
            };
            // @ts-expect-error TxtNode children should be readonly
            node.children = [];
            // @ts-expect-error TxtNode children should be readonly
            node.children.push(node.children[0]);
            // @ts-expect-error TxtNode location should be readonly
            node.loc.start = { line: 1, column: 0 };
            // @ts-expect-error TxtNode location should be readonly
            node.loc.end = { line: 1, column: 1 };
            // @ts-expect-error TxtNode location should be readonly
            node.loc.start.line = 1;
            // @ts-expect-error TxtNode location should be readonly
            node.loc.start.column = 0;
            // @ts-expect-error TxtNode parent should be readonly
            node.parent = node;
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
            // @ts-expect-error TxtListNode ordered should be readonly
            node.ordered = true;
            // @ts-expect-error TxtListNode start should be readonly
            node.start = 1;
            // @ts-expect-error TxtListNode spread should be readonly
            node.spread = false;
        },
        [Syntax.ListExit](node) {
            expectType<TxtListNode>(node);
        },
        [Syntax.ListItem](node) {
            expectType<TxtListItemNode>(node);
            // @ts-expect-error TxtListItemNode checked should be readonly
            node.checked = false;
        },
        [Syntax.ListItemExit](node) {
            expectType<TxtListItemNode>(node);
        },
        [Syntax.Header](node) {
            expectType<TxtHeaderNode>(node);
            // @ts-expect-error TxtHeaderNode depth should be readonly
            node.depth = 2;
        },
        [Syntax.HeaderExit](node) {
            expectType<TxtHeaderNode>(node);
        },
        [Syntax.CodeBlock](node) {
            expectType<TxtCodeBlockNode>(node);
            // @ts-expect-error TxtCodeBlockNode lang should be readonly
            node.lang = "js";
            // @ts-expect-error TxtCodeBlockNode meta should be readonly
            node.meta = "meta";
        },
        [Syntax.CodeBlockExit](node) {
            expectType<TxtCodeBlockNode>(node);
        },
        [Syntax.Link](node) {
            expectType<TxtLinkNode>(node);
            // @ts-expect-error TxtResource url should be readonly
            node.url = "https://example.com";
            // @ts-expect-error TxtResource title should be readonly
            node.title = "example";
        },
        [Syntax.LinkExit](node) {
            expectType<TxtLinkNode>(node);
        },
        [Syntax.LinkReference](node) {
            expectType<TxtLinkReferenceNode>(node);
            // @ts-expect-error TxtLinkReferenceNode referenceType should be readonly
            node.referenceType = "full";
            // @ts-expect-error TxtReference identifier should be readonly
            node.identifier = "id";
            // @ts-expect-error TxtReference label should be readonly
            node.label = "label";
        },
        [Syntax.LinkReferenceExit](node) {
            expectType<TxtLinkReferenceNode>(node);
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
            // @ts-expect-error TxtAlternative alt should be readonly
            node.alt = "alt";
        },
        [Syntax.ImageExit](node) {
            expectType<TxtImageNode>(node);
        },
        [Syntax.ImageReference](node) {
            expectType<TxtImageReferenceNode>(node);
        },
        [Syntax.ImageReferenceExit](node) {
            expectType<TxtImageReferenceNode>(node);
        },
        [Syntax.Definition](node) {
            expectType<TxtDefinitionNode>(node);
        },
        [Syntax.DefinitionExit](node) {
            expectType<TxtDefinitionNode>(node);
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
            // @ts-expect-error TxtTextNode value should be readonly
            node.value = "modified";
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
        [Syntax.Table](node) {
            expectType<TxtTableNode>(node);
            // @ts-expect-error TxtTableNode align should be readonly
            node.align?.push("left");
        },
        [Syntax.TableExit](node) {
            expectType<TxtTableNode>(node);
        },
        [Syntax.TableRow](node) {
            expectType<TxtTableRowNode>(node);
        },
        [Syntax.TableRowExit](node) {
            expectType<TxtTableRowNode>(node);
        },
        [Syntax.TableCell](node) {
            expectType<TxtTableCellNode>(node);
        },
        [Syntax.TableCellExit](node) {
            expectType<TxtTableCellNode>(node);
        },
    };
};
noop(report);
