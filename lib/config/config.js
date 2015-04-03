// LICENSE : MIT
"use strict";
var path = require("path");
var objectAssign = require("object-assign");
var defaultRulesDirPath = path.join(__dirname, "..", "..", "rules");
/**
 * @type {TextLintConfig}
 */
var defaultOptions = {
    rulePaths: [defaultRulesDirPath],
    extensions: [".md", ".mdk", ".markdown", ".mkdn", ".txt"],
    // formatter-file-name
    // e.g.) stylish.js => set "stylish"
    formatterName: "stylish"
};

/**
 * initialize with options.
 * @param {TextLintConfig} options the option object is defined as TextLintConfig.
 * @returns {Config}
 * @constructor
 */
function Config(options) {
    if (typeof options !== "object") {
        return objectAssign(this, defaultOptions);
    }
    this.extensions = options.extensions ? options.extensions : defaultOptions.extensions;
    this.rulePaths = options.rulePaths ? options.rulePaths : defaultOptions.rulePaths;
    this.formatterName = options.formatterName ? options.formatterName : defaultOptions.formatterName;
}
/**
 * Create config object form command line options
 * See options.js
 * @param {object} cliOptions the options is command line option object. @see options.js
 * @returns {Config}
 */
Config.initWithCLIOptions = function (cliOptions) {
    var options = {};
    options.extensions = cliOptions.ext ? cliOptions.ext : defaultOptions.extensions;
    options.rulePaths = cliOptions.rulesdir ? cliOptions.rulesdir : defaultOptions.rulePaths;
    options.formatterName = cliOptions.format ? cliOptions.format : defaultOptions.formatterName;
    return new Config(options);
};

module.exports = Config;
