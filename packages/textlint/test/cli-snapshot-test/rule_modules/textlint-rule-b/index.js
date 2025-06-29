module.exports = (context) => {
    return {
        [context.Syntax.Document](node) {
            context.report(node, new context.RuleError("Rule B report"));
        }
    };
};
