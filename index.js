// LICENSE : MIT
"use strict";
// Level of abstraction
// cli > TextLintEngine > textlint
module.exports = {
    // Command line interface
    cli: require("./lib/cli"),
    // TextLintEngine is a wrapper around `textlint` for linting multiple files
    TextLintEngine: require("./lib/textlint-engine"),
    // Core API for linting a single text.
    textlint: require("./lib/textlint")
};