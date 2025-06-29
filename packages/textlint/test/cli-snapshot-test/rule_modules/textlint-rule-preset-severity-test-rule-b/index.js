module.exports = function (context, options = {}) {
    return {
        [context.Syntax.Str](node) {
            if (node.value.includes("rule-b-error")) {
                context.report(node, `Rule B error message with option: ${options.customOption || "none"}`);
            }
        }
    };
};

module.exports.meta = {
    docs: {
        description: "Test rule B for severity testing",
        category: "lint"
    },
    type: "suggestion",
    severity: "error" // default severity
};
