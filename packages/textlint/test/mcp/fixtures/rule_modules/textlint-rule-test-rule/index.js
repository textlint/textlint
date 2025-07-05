// Simple test rule for MCP testing
module.exports = (context) => {
    return {
        [context.Syntax.Document](node) {
            const text = context.getSource();
            if (text.includes("TODO")) {
                context.report(node, new context.RuleError("Found TODO in document"));
            }
        }
    };
};
