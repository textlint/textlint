// LICENSE : MIT
"use strict";
// Level of abstraction
// cli > TextLintEngine > textlint
module.exports = {
    // Command line interface
    cli: require("./cli"),
    // TextLintEngine is a wrapper around `textlint` for linting multiple files
    TextLintEngine: require("./textlint-engine"),
    // Core API for linting a single text.
    textlint: require("./textlint")
};