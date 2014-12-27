// LICENSE : MIT
"use strict";
var dictionaryItems = require("technical-word-rules");
/**
 * @param {RuleContext} context
 */
module.exports = function (context) {
    var exports = {};

    exports[context.Syntax.Str] = function (node) {
        var text = context.getSource(node);
        for (var i = 0; i < dictionaryItems.length; i++) {
            var dictionary = dictionaryItems[i];
            var query = new RegExp(dictionary.pattern, dictionary.flag);
            var match = query.exec(text);
            if (!match) {
                continue;
            }
            var matchedString = match[0];
            // s/Web/Web/iは大文字小文字無視してWebに変換したいという意味に対応する
            if (dictionary.flag != null) {
                var strictQuery = new RegExp(dictionary.pattern);
                var isStrictMatch = strictQuery.test(match[0]);
                // /Web/i でマッチするけど、 /Web/ でマッチするならそれは除外する
                if (isStrictMatch) {
                    continue;
                }
            }
            // [start, end]
            var matchedStartIndex = match.index;
            var matchedEndIndex = matchedStartIndex + (matchedString.length);
            var expected = matchedString.replace(query, dictionary.expected);
            context.report(node, new context.RuleError(matchedString + " => " + expected, matchedStartIndex, matchedEndIndex));
        }
    };
    return exports;
};
