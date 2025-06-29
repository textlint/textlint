// 警告レベルのルール
module.exports = (context) => {
    return {
        [context.Syntax.Str](node) {
            if (node.value.includes("warning")) {
                context.report(node, new context.RuleError("Found warning text"));
            }
        }
    };
};
