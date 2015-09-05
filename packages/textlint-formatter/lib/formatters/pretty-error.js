// LICENSE : MIT

// Original code is https://github.com/azer/prettify-error
// Author : azer
"use strict";
var format = require("format-text");
var leftpad = require("left-pad");
var style = require("style-format");

var template = style('{grey}{ruleId}: {bold}{red}{title} {grey}{filename}:{failingLineNo}:{failingColNo}{reset}\n'
+ '    {red}{v}\n'
+ '    {grey}{previousLineNo}. {previousLine}\n'
+ '    {reset}{failingLineNo}. {failingLine}\n'
+ '    {grey}{nextLineNo}. {nextLine}\n'
+ '    {red}{^}{reset}\n'
+ '{reset}');


/**
 *
 * @param {string} code
 * @param {TextLintMessage} message
 * @returns {*}
 */
function failingCode(code, message) {
    var result = [];
    var lines = code.split('\n');
    var i = message.line - 3;
    while (++i < message.line + 1) {
        if (i + 1 !== message.line) {
            result.push({
                line: message.line - (message.line - i - 1),
                code: lines[i]
            });
            continue;
        }

        result.push({
            line: message.line,
            col: message.column,
            code: lines[i],
            failed: true
        });
    }

    return result;
}

function showColumn(code, tabn, ch) {
    var result = '';
    var i = String(code[1].line).length + code[1].col + 1 + tabn;

    while (i--) {
        result += ' ';
    }

    return result + ch;
}
/**
 *
 * @param {string} code
 * @param {string} filePath
 * @param {TextLintMessage} message
 * @returns {*}
 */
function prettifyError(code, filePath, message) {
    if (!code) {
        return;
    }
    var parsed = failingCode(code, message);
    var previousLineNo = String(parsed[0].line);
    var failingLineNo = String(parsed[1].line);
    var nextLineNo = String(parsed[2].line);
    var linumlen = Math.max(previousLineNo.length,
        failingLineNo.length,
        nextLineNo.length);

    return format(template, {
        ruleId: message.ruleId,
        title: message.message,
        filename: filePath,
        previousLine: parsed[0].code,
        previousLineNo: leftpad(previousLineNo, linumlen),
        previousColNo: parsed[0].col,
        failingLine: parsed[1].code,
        failingLineNo: leftpad(failingLineNo, linumlen),
        failingColNo: parsed[1].col,
        nextLine: parsed[2].code,
        nextLineNo: leftpad(nextLineNo, linumlen),
        nextColNo: parsed[2].col,
        '^': showColumn(parsed, linumlen - failingLineNo.length, '^'),
        'v': showColumn(parsed, linumlen - failingLineNo.length, 'v')
    });
}


/**
 *
 * @param {[TextLintResult]} results
 * @returns {string}
 */
module.exports = function (results) {
    var output = "";
    output += results.map(function (result) {
        var code = require("fs").readFileSync(result.filePath, "utf-8");
        return result.messages.map(function (message) {
            return prettifyError(code, result.filePath, message);
        }).join("\n");
    }).join("\n");

    return output;
};
