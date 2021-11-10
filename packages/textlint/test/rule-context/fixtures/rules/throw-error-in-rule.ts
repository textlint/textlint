// LICENSE : MIT
"use strict";

import { TextlintRuleContext, TextlintRuleReportHandler } from "@textlint/types";

export default function (context: TextlintRuleContext) {
    const exports: TextlintRuleReportHandler = {};
    exports[`${context.Syntax.Str}:exit`] = function () {
        throw new Error("Error in rule");
    };
    return exports;
}
