// LICENSE : MIT
import { ASTNodeTypes } from "@textlint/ast-node-types";

export const Syntax = {
    Document: ASTNodeTypes.Document, // must
    Paragraph: ASTNodeTypes.Paragraph,
    // inline
    Str: ASTNodeTypes.Str, // must
    Break: ASTNodeTypes.Break // must
} as const;
