module.exports = function (context) {
    const exports = {};
    exports[context.Syntax.Str] = function (node) {
        context.shouldIgnore(node.range);
    };
    return exports;
};
