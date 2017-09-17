module.exports = function(context) {
    var exports = {};
    exports[context.Syntax.Str] = function(node) {
        context.shouldIgnore(node.range);
    };
    return exports;
};
