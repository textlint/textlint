// LICENSE : MIT
"use strict";
var TextLintEngine = require("../../../index").TextLintEngine;
var path = require("path");
function lintFile(filePath) {
    /**
     * @type {TextLintConfig}
     * See lib/_typing/textlint.d.ts
     */
    var options = {
        // load rules from [../rules]
        rulePaths: [path.join(__dirname, "..", "rules/")],
        formatName: "pretty-error"
    };
    var engine = new TextLintEngine(options);
    var filePathList = [path.resolve(process.cwd(), filePath)];
    var results = engine.executeOnFiles(filePathList);
    var output = engine.formatResults(results);
    console.log(output);
}

lintFile(path.join(__dirname, "..", "..", "create-rules.md"));