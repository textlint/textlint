// LICENSE : MIT

import type { TextlintFixResult } from "@textlint/types";

module.exports = function (results: TextlintFixResult[]) {
    return `example-fixer-formatter\n${results
        .map(function (result) {
            return result.applyingMessages.map(function (_message) {
                return "xxx";
            });
        })
        .join("\n")}`;
};
