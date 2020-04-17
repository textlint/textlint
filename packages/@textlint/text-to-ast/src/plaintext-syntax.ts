// LICENSE : MIT
"use strict";
import { ASTNodeTypes } from "@textlint/ast-node-types";

export default {
    Document: ASTNodeTypes.Document, // must
    Paragraph: ASTNodeTypes.Paragraph,
    // inline
    Str: ASTNodeTypes.Str, // must
    Break: ASTNodeTypes.Break // must
};
