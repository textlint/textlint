export default (context) => {
    return {
        [context.Syntax.Document](node) {
            context.report(node, new context.RuleError("Rule ESM-B report"));
        }
    };
};
