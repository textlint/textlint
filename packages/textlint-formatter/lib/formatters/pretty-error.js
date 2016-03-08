// LICENSE : MIT

// Original code is https://github.com/azer/prettify-error
// Author : azer
"use strict";
var format = require("format-text");
var leftpad = require("left-pad");
var style = require("style-format");
var stripAnsi = require("strip-ansi");
var stringWidth = require("../stringWidth");
// width is 2
var widthOfString = stringWidth({ambiguousEastAsianCharWidth: 2});
var template = style('{grey}{ruleId}: {bold}{red}{title}\n'
    + '{grey}{filename}{reset}\n'
    + '    {red}{paddingForLineNo}  {v}\n'
    + '    {grey}{previousLineNo}. {previousLine}\n'
    + '    {reset}{failingLineNo}. {failingLine}\n'
    + '    {grey}{nextLineNo}. {nextLine}\n'
    + '    {red}{paddingForLineNo}  {^}{reset}\n'
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

function showColumn(codes, ch) {
    var result = '';
    var codeObject = codes[1];
    var sliced = codeObject.code.slice(0, codeObject.col);
    var i = widthOfString(sliced) - 1;

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
function prettyError(code, filePath, message) {
    if (!code) {
        return;
    }
    var parsed = failingCode(code, message);
    var previousLineNo = String(parsed[0].line);
    var failingLineNo = String(parsed[1].line);
    var nextLineNo = String(parsed[2].line);
    var linumlen = Math.max(previousLineNo.length, failingLineNo.length,
        nextLineNo.length);
    return format(template, {
        ruleId: message.ruleId,
        title: message.message,
        filename: filePath + ":" + message.line + ":" + message.column,
        previousLine: parsed[0].code ? parsed[0].code : "",
        previousLineNo: leftpad(previousLineNo, linumlen),
        previousColNo: parsed[0].col,
        failingLine: parsed[1].code,
        failingLineNo: leftpad(failingLineNo, linumlen),
        failingColNo: parsed[1].col,
        nextLine: parsed[2].code ? parsed[2].code : "",
        nextLineNo: leftpad(nextLineNo, linumlen),
        nextColNo: parsed[2].col,
        paddingForLineNo: leftpad('', linumlen),
        '^': showColumn(parsed, '^'),
        'v': showColumn(parsed, 'v')
    });
}

/**
 *
 * @param {[TextLintResult]} results
 * @param {TextLintFormatterOption} options
 * @returns {string}
 */
function formatter(results, options) {
    var noColor = options.noColor !== undefined ? options.noColor : false;
    var output = "";
    results.forEach(function (result) {
        var code = require("fs").readFileSync(result.filePath, "utf-8");
        result.messages.forEach(function (message) {
            var r = prettyError(code, result.filePath, message);
            if (r) {
                output += r + "\n";
            }
        });
    });
    // --no-color 
    if (noColor) {
        return stripAnsi(output);
    }
    return output;
}
module.exports = formatter;
module.exports.prettyError = prettyError;