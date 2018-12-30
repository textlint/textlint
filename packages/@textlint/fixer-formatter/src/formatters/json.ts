// LICENSE : MIT
"use strict";
import { TextlintFixResult } from "@textlint/types";
export default function(results: TextlintFixResult[]) {
    return JSON.stringify(results);
}
