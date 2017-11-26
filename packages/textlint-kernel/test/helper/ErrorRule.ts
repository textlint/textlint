// MIT © 2017 azu

import { RuleCreatorReporter, TextLintRuleCreator } from "../../src/core/rule-creator-helper";
import RuleContext from "../../src/core/rule-context";
import { TxtNode } from "../../src/textlint-kernel-interface";

export interface ReportOptions {
    errors?: {
        index: number;
        range: [number, number];
        message: string;
        output: string;
    }[];
}

export const report: RuleCreatorReporter = (context: RuleContext, options: ReportOptions | any = {}) => {
    const errors = options.errors || [];
    const { Syntax, RuleError, report, fixer } = context;
    return {
        [Syntax.Document](node: TxtNode) {
            errors.forEach((error: any) => {
                if (error.range && error.output) {
                    report(
                        node,
                        new RuleError(error.message, {
                            index: error.index,
                            fix: fixer.replaceTextRange(error.range, error.output)
                        })
                    );
                } else {
                    report(
                        node,
                        new RuleError(error.message, {
                            index: error.index
                        })
                    );
                }
            });
        }
    };
};
export const errorRule: TextLintRuleCreator = {
    linter: report,
    fixer: report
};
