// LICENSE : MIT
"use strict";
var fs = require("fs");
var createFormatter = require("./textlint-formatter");
module.exports = function run(argv, text) {
    return new Promise(function (resolve, reject) {
        var optionator = require('optionator')({
            prepend: 'Usage: textlint-formatter [options]',
            options: [
                {
                    option: 'help',
                    alias: 'h',
                    type: 'Boolean',
                    description: 'displays help'
                }, {
                    option: 'formatter',
                    alias: 'f',
                    type: 'String',
                    description: 'formatter name',
                    example: 'textlint -f json README.md | textlint-formatter -f pretty-error'
                },
                {
                    option: "stdin",
                    type: "Boolean",
                    default: "false",
                    description: "Format text provided on <STDIN>."
                }
            ]
        });
        var options = optionator.parseArgv(argv);
        var files = options._;
        if (options.help || !files.length && !text) {
            return resolve(optionator.generateHelp());
        }
        var content = text ? text : fs.readFileSync(files[0], "utf-8");
        var jsonContent;
        try {
            jsonContent = JSON.parse(content);
        } catch (error) {
            return new Error("Content should be json. " + error.message);
        }
        if (options.formatter) {
            var format = createFormatter({
                formatterName: options.formatter
            });
            return resolve(format(jsonContent));
        } else {
            // default: use stylish
            var format = createFormatter({
                formatterName: "stylish"
            });
            return resolve(format(jsonContent));
        }
    });
};