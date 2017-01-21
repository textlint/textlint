"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Promise = require("bluebird");
var fs = require("fs");
/**
 * @param {TextLintResult} result
 */
function overWriteResult(result) {
    return new Promise(function (resolve, reject) {
        var targetFilePath = result.filePath;
        var output = result.output;
        fs.writeFile(targetFilePath, output, function (error, result) {
            if (error) {
                return reject(error);
            }
            resolve(result);
        });
    });
}

var TextLintFixer = function () {
    function TextLintFixer() {
        _classCallCheck(this, TextLintFixer);
    }

    _createClass(TextLintFixer, [{
        key: "write",

        /**
         * write output to each files and return promise
         * @param textFixMessages
         * @returns {Promise}
         */
        value: function write(textFixMessages) {
            var promises = textFixMessages.map(overWriteResult);
            return Promise.all(promises);
        }
    }]);

    return TextLintFixer;
}();

exports.default = TextLintFixer;
//# sourceMappingURL=textlint-fixer.js.map