// LICENSE : MIT
import type { TextlintResult } from "@textlint/types";

function formatter(results: TextlintResult[]) {
    return `${JSON.stringify(results)}\n`;
}

export default formatter;
