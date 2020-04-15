// MIT © 2017 azu

import { TxtNode } from "@textlint/ast-node-types";
import { TextlintFilterRuleContext, TextlintFilterRuleReporter } from "@textlint/types";

export interface FilterOptions {
    allows: {
        range: [number, number];
        ruleId?: string;
    }[];
}

export const report: TextlintFilterRuleReporter = (
    context: Readonly<TextlintFilterRuleContext>,
    // TODO: remove any
    options: FilterOptions | any = {}
) => {
    const { Syntax, shouldIgnore } = context;
    return {
        [Syntax.Document](_node: TxtNode) {
            const allows = options.allows;
            Array.isArray(allows) &&
                allows.forEach((allow) => {
                    shouldIgnore(allow.range, allow.ruleId);
                });
        }
    };
};
export const filterRule = report;
