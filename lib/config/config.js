// LICENSE : MIT
"use strict";
var path = require("path");
var defaultRulesDirPath = path.join(__dirname, "..", "..", "rules");
var defaultOptions = {
    rulePaths: [defaultRulesDirPath],
    extensions: [".md", ".mdk", ".markdown", ".mkdn", ".txt"],
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
    this.rulePaths = options.rulesdir ? options.rulesdir : defaultOptions.rulePaths;
}
module.exports = Config;