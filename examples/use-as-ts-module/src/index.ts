// LICENSE : MIT
"use strict";
import { argv, cwd, exit } from "process";
import { resolve } from "path";
import { TextLintEngine } from "textlint";
import { TextlintResult } from "@textlint/kernel";

const [, , filename] = argv;

function lintFile(filePath: string) {
    const filePathList = [resolve(cwd(), filePath)];

    const engine = new TextLintEngine({
        rules: ["no-todo", "no-exclamation-question-mark"],
        formatterName: "pretty-error",
        color: false
    });

    return engine.executeOnFiles(filePathList).then(function (results: TextlintResult[]) {
        if (engine.isErrorResults(results)) {
            console.log(engine.formatResults(results));
        } else {
            console.log("All Passed!");
        }
    });
}

lintFile(filename).catch(function (error: TextlintResult) {
    console.error(error);
    exit(1);
});
