// エラーレベルのルール
module.exports = (context) => {
    return {
        [context.Syntax.Str](node) {
            if (node.value.includes("error")) {
                context.report(node, new context.RuleError("Found error text"));
            }
        }
    };
};
