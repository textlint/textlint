// LICENSE : MIT
"use strict";
import { TextlintTypes } from "@textlint/kernel";
export default function(results: TextlintTypes.TextlintFixResult[]) {
    return JSON.stringify(results);
}
