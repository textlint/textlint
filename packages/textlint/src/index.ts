// LICENSE : MIT
"use strict";

// Level of abstraction(descending order)
// cli > TextLintEngine > TextLintCore(textlint)
// See: https://github.com/textlint/textlint/blob/master/docs/use-as-modules.md

// Command line interface
export { cli } from "./cli";

// It is a singleton object of TextLintCore
// Recommend: use TextLintCore
export { textlint } from "./textlint";

// TextLintEngine is a wrapper around `textlint` for linting **multiple** files
// include formatter, detecting utils
// <Recommend>: It is easy to use
// You can see engine/textlint-engine-core.js for more detail
export { TextLintEngine } from "./textlint-engine";

// TextFixEngine is a wrapper around `textlint` for linting **multiple** files
// include formatter, detecting utils
// <Recommend>: It is easy to use
// You can see engine/textlint-engine-core.js for more detail
export { TextFixEngine } from "./textfix-engine";

// Core API for linting a **single** text or file.
export { TextLintCore } from "./textlint-core";

// Constant Types
// FIXME: will be removed
export { MessageType as TextLintMessageType } from "./shared/type/MessageType";
export { SeverityLevel as TextLintMessageSeverityLevel } from "./shared/type/SeverityLevel";
export { ASTNodeTypes as TextLintNodeType } from "@textlint/ast-node-types";
