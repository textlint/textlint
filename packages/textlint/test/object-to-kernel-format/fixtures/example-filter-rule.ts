// LICENSE : MIT

import type { TextlintFilterRuleContext, TextlintRuleReportHandler } from "@textlint/types";

export default function (context: TextlintFilterRuleContext): TextlintRuleReportHandler {
    return {
        [context.Syntax.Str](_node) {
            return;
        }
    };
}
