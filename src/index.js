// LICENSE : MIT
"use strict";
// Level of abstraction(descending order)
// cli > TextLintEngine > TextLintCore(textlint)
// See: https://github.com/textlint/textlint/blob/master/docs/use-as-modules.md
module.exports = {
    // Command line interface
    cli: require("./cli"),
    // TextLintEngine is a wrapper around `textlint` for linting **multiple** files
    // include formatter, detecting utils
    // <Recommend>: It is easy to use
    // You can see engine/textlint-engine-core.js for more detail
    TextLintEngine: require("./textlint-engine"),
    // TextFixEngine is a wrapper around `textlint` for linting **multiple** files
    // include formatter, detecting utils
    // <Recommend>: It is easy to use
    // You can see engine/textlint-engine-core.js for more detail
    TextFixEngine: require("./textfix-engine"),
    // It is a singleton object of TextLintCore
    // Recommend: use TextLintCore
    textlint: require("./textlint"),
    // Core API for linting a **single** text or file.
    TextLintCore: require("./textlint-core"),
    // for debug, don't use direct
    // It is used in textlint-tester
    _logger: require("./util/throw-log")
};
