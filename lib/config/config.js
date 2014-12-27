// LICENSE : MIT
"use strict";
var path = require("path");
var defaultOptions = {
    rulePaths: [],
    extensions: [".md", ".mdk", ".markdown", ".mkdn", ".txt"],
    ruleDir: path.join(__dirname, "..", "..", "rules"),
    rules: {}
};
/**
 * Create config object form command line options
 * See options.js
 * @param options
 * @constructor
 */
function Config(options) {
    this.extensions = options.ext ? options.ext : defaultOptions.extensions;
    this.rulesDir = options.rulesdir ? options.rulesdir : defaultOptions.ruleDir;
}
module.exports = Config;