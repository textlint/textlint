/**
 * @type {import("@textlint/types").TextlintRuleModule}}}
 */
export default (context) => {
    const { Syntax, RuleError } = context;
    return {
        [Syntax.Str](node) {
            context.report(node, new RuleError("ESM"));
        }
    };
}
