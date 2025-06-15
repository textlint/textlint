/**
 * @type {import("@textlint/types").TextlintRuleModule}}}
 */
module.exports = (context) => {
    const { Syntax, RuleError } = context;
    return {
        [Syntax.Str](node) {
            context.report(node, new RuleError("CJS"));
        }
    };
}
