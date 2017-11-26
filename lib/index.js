// LICENSE : MIT
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var cli_1 = require("./cli");
var textlint_1 = require("./textlint");
var textlint_engine_1 = require("./textlint-engine");
var textfix_engine_1 = require("./textfix-engine");
var textlint_core_1 = require("./textlint-core");
// FIXME: will be removed
var MessageType_1 = require("./shared/type/MessageType");
var SeverityLevel_1 = require("./shared/type/SeverityLevel");
var ast_node_types_1 = require("@textlint/ast-node-types");
// Level of abstraction(descending order)
// cli > TextLintEngine > TextLintCore(textlint)
// See: https://github.com/textlint/textlint/blob/master/docs/use-as-modules.md
module.exports = {
    // Command line interface
    cli: cli_1.cli,
    // TextLintEngine is a wrapper around `textlint` for linting **multiple** files
    // include formatter, detecting utils
    // <Recommend>: It is easy to use
    // You can see engine/textlint-engine-core.js for more detail
    TextLintEngine: textlint_engine_1.TextLintEngine,
    // TextFixEngine is a wrapper around `textlint` for linting **multiple** files
    // include formatter, detecting utils
    // <Recommend>: It is easy to use
    // You can see engine/textlint-engine-core.js for more detail
    TextFixEngine: textfix_engine_1.TextFixEngine,
    // It is a singleton object of TextLintCore
    // Recommend: use TextLintCore
    textlint: textlint_1.textlint,
    // Core API for linting a **single** text or file.
    TextLintCore: textlint_core_1.TextLintCore,
    // Constant Types
    TextLintMessageType: MessageType_1.MessageType,
    TextLintMessageSeverityLevel: SeverityLevel_1.SeverityLevel,
    TextLintNodeType: ast_node_types_1.ASTNodeTypes
};
