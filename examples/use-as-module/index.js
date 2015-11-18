// LICENSE : MIT
"use strict";
var TextLintEngine = require("textlint").TextLintEngine;
var path = require("path");
function lintFile(filePath) {
    /**
     * @type {TextLintConfig}
     * See lib/_typing/textlint.d.ts
     */
    var options = {
        // load rules from [../rules]
        rules: ["no-todo"],
        formatterName: "pretty-error"
    };
    var engine = new TextLintEngine(options);
    var filePathList = [path.resolve(process.cwd(), filePath)];
    engine.executeOnFiles(filePathList).then(function (results) {
        if (engine.isErrorResults(results)) {
            var output = engine.formatResults(results);
            console.log(output);
        } else {
            console.log("All Passed!");
        }
    });
}

lintFile(__dirname + "/README.md");