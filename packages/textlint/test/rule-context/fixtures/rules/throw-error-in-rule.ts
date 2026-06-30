// LICENSE : MIT

import type { TextlintRuleContext, TextlintRuleReportHandler } from "@textlint/types";

export default function (context: TextlintRuleContext): TextlintRuleReportHandler {
    return {
        [`${context.Syntax.Str}:exit`]() {
            throw new Error("Error in rule");
        }
    };
}
