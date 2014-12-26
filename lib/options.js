// LICENSE : MIT
"use strict";
var optionator = require("optionator");
module.exports = optionator({
    prepend: "textlint [options] file.js [file.js] [dir]",
    concatRepeatedArrays: true,
    mergeRepeatedObjects: true,
    options: [
        {
            heading: "Options"
        }, {
            option: "help",
            alias: "h",
            type: "Boolean",
            description: "Show help."
        }, {
            option: "rulesdir",
            type: "[path::String]",
            description: "Load additional rules from this directory."
        }, {
            option: "format",
            alias: "f",
            type: "String",
            default: "stylish",
            description: "Use a specific output format."
        }, {
            option: "version",
            alias: "v",
            type: "Boolean",
            description: "Outputs the version number."
        }, {
            option: "reset",
            type: "Boolean",
            description: "Set all default rules to off."
        }, {
            option: "eslintrc",
            type: "Boolean",
            default: "true",
            description: "Enable loading .eslintrc configuration."
        }, {
            option: "env",
            type: "[String]",
            description: "Specify environments."
        }, {
            option: "ext",
            type: "[String]",
            default: ".js",
            description: "Specify JavaScript file extensions."
        }, {
            option: "plugin",
            type: "[String]",
            description: "Specify plugins."
        }, {
            option: "rule",
            type: "Object",
            description: "Specify rules."
        },
        {
            option: "color",
            type: "Boolean",
            default: "true",
            description: "Enable color in piped output."
        },
        {
            option: "output-file",
            alias: "o",
            type: "path::String",
            description: "Enable report to be written to a file."
        },
        {
            option: "quiet",
            type: "Boolean",
            default: "false",
            description: "Report errors only."
        },
        {
            option: "stdin",
            type: "Boolean",
            default: "false",
            description: "Lint code provided on <STDIN>."
        }
    ]
});
