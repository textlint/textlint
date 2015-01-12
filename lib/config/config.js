// LICENSE : MIT
"use strict";
var path = require("path");
var defaultRulesDirPath = path.join(__dirname, "..", "..", "rules");
var defaultOptions = {
    rulePaths: [defaultRulesDirPath],
    extensions: [".md", ".mdk", ".markdown", ".mkdn", ".txt"],
    /**
     * @type {RulesObject} rule object
     */
    rules: {},
    // formatter-file-name
    // e.g.) stylish.js => set "stylish"
    formatName: "stylish"
};
/**
 * Create config object form command line options
 * See options.js
 * @param {object} options the options is command line option object. @see options.js
 * @constructor
 */
function Config(options) {
    if (typeof options !== "object") {
        return this;
    }
    this.extensions = options.ext ? options.ext : defaultOptions.extensions;
    this.rulePaths = options.rulesdir ? options.rulesdir : defaultOptions.rulePaths;
    this.formatName = options.format ? options.format : defaultOptions.formatName;
}
module.exports = Config;