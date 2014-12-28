// LICENSE : MIT
"use strict";
var seperators = ['---', '= yaml =']
var pattern = pattern = '^('
+ '((= yaml =)|(---))'
+ '$([\\s\\S]*?)'
+ '\\2'
+ '$'
+ (process.platform === 'win32' ? '\\r?' : '')
+ '(?:\\n)?)';
var yamlRegexp = new RegExp(pattern, 'm');

function replaceByBr(text) {
    return text.replace(yamlRegexp, function (all) {
        var lines = all.split("\n");
        return (new Array(lines.length)).join("\n");
    });

}
function normalize(markdown) {
    if (yamlRegexp.test(markdown)) {
        return replaceByBr(markdown);
    }
    return markdown;
}
module.exports = normalize;
