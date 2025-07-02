// MIT © 2017 azu

import { TxtNode } from "@textlint/ast-node-types";
import type { TextlintRuleContext, TextlintRuleModule, TextlintRuleReporter } from "@textlint/types";
import * as assert from "node:assert";

export interface ReportOptions {
    errors?: {
        range: readonly [number, number];
        message: string;
        output: string;
    }[];
}

export const report: TextlintRuleReporter = (
    context: Readonly<TextlintRuleContext>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options: ReportOptions | any = {}
) => {
    const errors = options.errors || [];
    const { Syntax, RuleError, report, fixer, locator } = context;
    return {
        [Syntax.Document](node: TxtNode) {
            errors.forEach((error: { range: readonly [number, number]; message: string; output?: string }) => {
                assert.ok(Array.isArray(error.range), "range should be an array");
                if (error.output) {
                    report(
                        node,
                        new RuleError(error.message, {
                            padding: locator.range(error.range),
                            fix: fixer.replaceTextRange(error.range, error.output)
                        })
                    );
                } else {
                    report(
                        node,
                        new RuleError(error.message, {
                            padding: locator.range(error.range)
                        })
                    );
                }
            });
        }
    };
};
export const errorRule: TextlintRuleModule = {
    linter: report,
    fixer: report
};
