module.exports = function (context, options = {}) {
    return {
        [context.Syntax.Str](node) {
            if (node.value.includes("rule-a-error")) {
                context.report(node, "Rule A error message");
            }
        }
    };
};

module.exports.meta = {
    docs: {
        description: "Test rule A for severity testing",
        category: "lint"
    },
    type: "suggestion",
    severity: "warning" // default severity
};
