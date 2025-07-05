// Test preset for MCP testing
module.exports = {
    rules: {
        "test-rule": require("../textlint-rule-test-rule"),
        "no-exclamation": (context) => {
            return {
                [context.Syntax.Document](node) {
                    const text = context.getSource();
                    if (text.includes("!")) {
                        context.report(node, new context.RuleError("Found exclamation mark"));
                    }
                }
            };
        }
    },
    rulesConfig: {
        "test-rule": true,
        "no-exclamation": true
    }
};
