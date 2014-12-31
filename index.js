// LICENSE : MIT
"use strict";
// Level of abstraction
// cli > CLIEngine > textlint
module.exports = {
    cli: require("./lib/cli"),
    CLIEngine: require("./lib/cli-engine"),
    textlint: require("./lib/textlint")
};