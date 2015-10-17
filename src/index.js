// LICENSE : MIT
"use strict";
// Level of abstraction(descending order)
// cli > TextLintEngine > TextLintCore(textlint)
// See: https://github.com/azu/textlint/blob/master/docs/use-as-modules.md
module.exports = {
    // Command line interface
    cli: require("./cli"),
    // TextLintEngine is a wrapper around `textlint` for linting **multiple** files
    // include formatter, detecting utils
    // Recommend: It is easy to use
    TextLintEngine: require("./textlint-engine"),
    // It is a singleton object of TextLintCore
    textlint: require("./textlint"),
    // Core API for linting a **single** text or file.
    TextLintCore: require("./textlint-core")
};
