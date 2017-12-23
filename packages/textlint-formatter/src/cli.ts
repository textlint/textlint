// LICENSE : MIT
"use strict";
const fs = require("fs");
import { createFormatter } from "./textlint-formatter";

module.exports = function run(argv: string[], text: string) {
    return new Promise(function(resolve) {
        let format;
        const optionator = require("optionator")({
            prepend: "Usage: textlint-formatter [options]",
            options: [
                {
                    option: "help",
                    alias: "h",
                    type: "Boolean",
                    description: "displays help"
                },
                {
                    option: "formatter",
                    alias: "f",
                    type: "String",
                    description: "formatter name",
                    example: "textlint -f json README.md | textlint-formatter -f pretty-error"
                },
                {
                    option: "stdin",
                    type: "Boolean",
                    default: "false",
                    description: "Format text provided on <STDIN>."
                }
            ]
        });
        const options = optionator.parseArgv(argv);
        const files = options._;
        if (options.help || (!files.length && !text)) {
            return resolve(optionator.generateHelp());
        }
        const content = text ? text : fs.readFileSync(files[0], "utf-8");
        let jsonContent;
        try {
            jsonContent = JSON.parse(content);
        } catch (error) {
            return new Error("Content should be json. " + error.message);
        }
        if (options.formatter) {
            format = createFormatter({
                formatterName: options.formatter
            });
            return resolve(format(jsonContent));
        } else {
            // default: use stylish
            format = createFormatter({
                formatterName: "stylish"
            });
            return resolve(format(jsonContent));
        }
    });
};
