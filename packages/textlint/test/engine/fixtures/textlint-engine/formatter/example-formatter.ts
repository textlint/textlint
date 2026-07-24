// LICENSE : MIT

import type { TextlintResult } from "@textlint/types";

export default function (results: TextlintResult[]) {
    return `example-formatter\n${results
        .map(function (result) {
            return result.messages.map(function (_message) {
                return "xxx";
            });
        })
        .join("\n")}`;
}
