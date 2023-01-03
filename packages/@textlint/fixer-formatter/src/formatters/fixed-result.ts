// LICENSE : MIT
"use strict";
import type { TextlintFixResult } from "@textlint/types";

export default function (results: TextlintFixResult[]) {
    let output = "";
    results.forEach((result) => (output += `${result.output}`));

    return output;
}
