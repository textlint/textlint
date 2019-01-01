import { ASTNodeTypes, TxtNode, TxtParentNode, TxtTextNode } from "@textlint/ast-node-types";
/**
 * Return TxtNode type of ASTNodeTypes | string
 *
 * @example
 * ```
 * type NodeType = TxtNodeTypeOfNode<ASTNodeTypes.Document>;
 */
export type TypeofTxtNode<T extends ASTNodeTypes | string> =
    // Root
    T extends ASTNodeTypes.Document
        ? TxtParentNode
        : // Paragraph Str.
        T extends ASTNodeTypes.Paragraph
        ? TxtParentNode
        : // > Str
        T extends ASTNodeTypes.BlockQuote
        ? TxtParentNode
        : // - item
        T extends ASTNodeTypes.List
        ? TxtParentNode
        : // - item
        T extends ASTNodeTypes.ListItem
        ? TxtParentNode
        : // # Str
        T extends ASTNodeTypes.Header
        ? TxtParentNode
        : /* ```
         * code
         * ```
         */
        T extends ASTNodeTypes.CodeBlock
        ? TxtParentNode
        : // <div>\n</div>
        T extends ASTNodeTypes.HtmlBlock
        ? TxtParentNode
        : // [link](https://example.com)
        T extends ASTNodeTypes.Link
        ? TxtParentNode
        : // [link][]
        T extends ASTNodeTypes.ReferenceDef
        ? TxtParentNode
        : // ~~Str~~
        T extends ASTNodeTypes.Delete
        ? TxtParentNode
        : // *Str*
        T extends ASTNodeTypes.Emphasis
        ? TxtParentNode
        : // __Str__
        T extends ASTNodeTypes.Strong
        ? TxtParentNode
        : // Str<space><space>
        T extends ASTNodeTypes.Break
        ? TxtNode
        : // ![alt](https://example.com/img)
        T extends ASTNodeTypes.Image
        ? TxtNode
        : // <!-- Str -->
        T extends ASTNodeTypes.Comment
        ? TxtTextNode
        : // Str
        T extends ASTNodeTypes.Str
        ? TxtTextNode
        : // `code`
        T extends ASTNodeTypes.Code
        ? TxtTextNode
        : // <span>Str</span>
        T extends ASTNodeTypes.Html
        ? TxtTextNode
        : // ----
        T extends ASTNodeTypes.HorizontalRule
        ? TxtTextNode
        : any;
