import { TextlintRuleReporter } from "../../src/Rule/TextlintRuleModule";
import { TextlintRuleModule, TextlintRuleOptions } from "@textlint/types";

const noop = (..._args: any[]) => {};

// test any
const report0: TextlintRuleReporter = (context, options = {}) => {
    const { Syntax } = context;
    console.log(options.custom);
    return {
        [Syntax.Str]() {
            return;
        }
    };
};
// test TextlintRuleReporter
type Report1Options = {
    custom?: string;
};
const report1: TextlintRuleReporter<Report1Options> = (context, options = {}) => {
    const { Syntax } = context;
    console.log(options.custom);
    return {
        [Syntax.Str]() {
            return;
        }
    };
};

// test TextlintRuleOptions
type Report2Options = {
    custom?: number;
};
const report2: TextlintRuleReporter = (context, options: TextlintRuleOptions<Report2Options> = {}) => {
    const { Syntax } = context;
    console.log(options.custom);
    return {
        [Syntax.Str]() {
            return;
        }
    };
};

// test module <T>
type Report3options = {
    custom: number;
};
const report3: TextlintRuleReporter = (context, options = {}) => {
    const { Syntax } = context;
    console.log(options.custom);
    return {
        [Syntax.Str]() {
            return;
        }
    };
};
const report3Module = { linter: report3, fixer: report3 } as TextlintRuleModule<Report3options>;

noop(report0);
noop(report1);
noop(report2);
noop(report3);
noop(report3Module);
