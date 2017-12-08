// LICENSE : MIT
"use strict";
var fs = require("fs");
var assert = require("assert");
var path = require("path");
var tryResolve = require('try-resolve');

/** @typedef {Object} TextLintFormatterOption
 *  @property {string} formatterName
 *  @property {boolean} noColor
 */

/**
 * Create formatter function from {@link options}
 * @param {TextLintFormatterOption} options
 * @returns {Function} the returned Function is formatter
 */
function createFormatter(options) {
    assert(typeof options === "object", "options should be object");
    var formatName = options.formatterName;
    var formatterPath;
    if (fs.existsSync(formatName)) {
        formatterPath = formatName;
    } else if (fs.existsSync(path.resolve(process.cwd(), formatName))) {
        formatterPath = path.resolve(process.cwd(), formatName);
    } else {
        var pkgPath = tryResolve("textlint-formatter-" + formatName) || tryResolve(formatName);
        if (pkgPath) {
            formatterPath = pkgPath;
        } else {
            formatterPath = path.join(__dirname, "formatters/", formatName);
        }
    }
    try {
        var formatter = require(formatterPath);
    } catch (ex) {
        throw new Error("Could not find formatter " + formatName + "\n" + ex);
    }
    return function (results) {
        return formatter(results, options);
    };
}
module.exports = createFormatter;