// LICENSE : MIT
"use strict";
const textlintCreateFormatter = require("textlint-formatter");
const stylish = require("./formatters/stylish");
export default function createFormatter(formatterConfig) {
    if (formatterConfig.formatterName) {
        const formatter = textlintCreateFormatter(formatterConfig);
        /**
         * @type {TextLintFixResult[]} results
         */
        return function (results) {
            // FIXME: hack for compatible TextLintFixResult and textlint-formatter
            if (results.remainingMessages) {
                // alias messages
                results.messages = results.remainingMessages;
            }
            return formatter(results);
        };
    }
    // builtin
    function builtinFormatter(code) {
        return stylish(code, formatterConfig);
    }
    return builtinFormatter;
}
