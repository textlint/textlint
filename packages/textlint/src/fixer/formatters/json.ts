// LICENSE : MIT
"use strict";
import { TextlintTypes } from "@textlint/kernel";
module.exports = function(results: TextlintTypes.TextlintFixResult[]) {
    return JSON.stringify(results);
};
