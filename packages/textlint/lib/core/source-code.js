"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _TextLintNodeType;

function _load_TextLintNodeType() {
    return _TextLintNodeType = _interopRequireDefault(require("../shared/type/TextLintNodeType"));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var assert = require("assert");
var StructuredSource = require("structured-source");

/**
 * Validates that the given AST has the required information.
 * @param {TxtAST.TxtNode} [ast] The Program node of the AST to check.
 * @throws {Error} If the AST doesn't contain the correct information.
 * @returns {void}
 * @private
 */
function validate(ast) {
    if (!ast.loc) {
        throw new Error("AST is missing location information.");
    }

    if (!ast.range) {
        throw new Error("AST is missing range information");
    }
}

/**
 * This class represent of source code.
 */

var SourceCode = function () {
    function SourceCode(_ref) {
        var _ref$text = _ref.text,
            text = _ref$text === undefined ? "" : _ref$text,
            ast = _ref.ast,
            ext = _ref.ext,
            filePath = _ref.filePath;

        _classCallCheck(this, SourceCode);

        validate(ast);
        assert(ext || filePath, "should be set either of fileExt or filePath.");
        this.hasBOM = text.charCodeAt(0) === 0xFEFF;
        this.text = this.hasBOM ? text.slice(1) : text;
        /**
         * @type StructuredSource
         */
        this._structuredSource = new StructuredSource(this.text);
        this.ast = ast;
        this.filePath = filePath;
        // fileType .md .txt ...
        this.ext = ext;
    }

    /**
     * @returns {TextLintNodeType}
     */


    _createClass(SourceCode, [{
        key: "getSyntax",
        value: function getSyntax() {
            return (_TextLintNodeType || _load_TextLintNodeType()).default;
        }

        /**
         * get filePath
         * @returns {string|undefined}
         */

    }, {
        key: "getFilePath",
        value: function getFilePath() {
            return this.filePath;
        }

        /**
         * Gets the source code for the given node.
         * @param {TxtNode=} node The AST node to get the text for.
         * @param {int=} beforeCount The number of characters before the node to retrieve.
         * @param {int=} afterCount The number of characters after the node to retrieve.
         * @returns {string|null} The text representing the AST node.
         */

    }, {
        key: "getSource",
        value: function getSource(node, beforeCount, afterCount) {
            var currentText = this.text;
            if (currentText == null) {
                return null;
            }
            if (node) {
                var start = Math.max(node.range[0] - (beforeCount || 0), 0);
                var end = node.range[1] + (afterCount || 0);
                return currentText.slice(start, end);
            } else {
                return currentText;
            }
        }

        // StructuredSource wrapper
        /**
         * @param {SourceLocation} loc - location indicator.
         * @return {[ number, number ]} range.
         */

    }, {
        key: "locationToRange",
        value: function locationToRange(loc) {
            return this._structuredSource.locationToRange(loc);
        }

        /**
         * @param {[ number, number ]} range - pair of indice.
         * @return {SourceLocation} location.
         */

    }, {
        key: "rangeToLocation",
        value: function rangeToLocation(range) {
            return this._structuredSource.rangeToLocation(range);
        }

        /**
         * @param {Position} pos - position indicator.
         * @return {number} index.
         */

    }, {
        key: "positionToIndex",
        value: function positionToIndex(pos) {
            return this._structuredSource.positionToIndex(pos);
        }

        /**
         * @param {number} index - index to the source code.
         * @return {Position} position.
         */

    }, {
        key: "indexToPosition",
        value: function indexToPosition(index) {
            return this._structuredSource.indexToPosition(index);
        }
    }]);

    return SourceCode;
}();

exports.default = SourceCode;
//# sourceMappingURL=source-code.js.map