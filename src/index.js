// LICENSE : MIT
"use strict";
import cli from "./cli";
import textlint from "./textlint";
import TextLintEngine from "./textlint-engine";
import TextFixEngine from "./textfix-engine";
import TextLintCore from "./textlint-core";
import MessageType from "./shared/type/MessageType";
import SeverityLevel from "./shared/type/SeverityLevel";
import TextLintNodeType from "./shared/type/TextLintNodeType";
import * as _logger from "./util/throw-log";
// Level of abstraction(descending order)
// cli > TextLintEngine > TextLintCore(textlint)
// See: https://github.com/textlint/textlint/blob/master/docs/use-as-modules.md
module.exports = {
    // Command line interface
    cli,
    // TextLintEngine is a wrapper around `textlint` for linting **multiple** files
    // include formatter, detecting utils
    // <Recommend>: It is easy to use
    // You can see engine/textlint-engine-core.js for more detail
    TextLintEngine,
    // TextFixEngine is a wrapper around `textlint` for linting **multiple** files
    // include formatter, detecting utils
    // <Recommend>: It is easy to use
    // You can see engine/textlint-engine-core.js for more detail
    TextFixEngine,
    // It is a singleton object of TextLintCore
    // Recommend: use TextLintCore
    textlint,
    // Core API for linting a **single** text or file.
    TextLintCore,
    // Constant Types
    TextLintMessageType: MessageType,
    TextLintMessageSeverityLevel: SeverityLevel,
    TextLintNodeType: TextLintNodeType,
    // for debug, don't use direct
    // It is used in textlint-tester
    _logger
};
