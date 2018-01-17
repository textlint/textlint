// LICENSE : MIT
"use strict";
import { TextlintResult } from "@textlint/kernel";

function formatter(results: TextlintResult[]) {
    return JSON.stringify(results);
}

export default formatter;
