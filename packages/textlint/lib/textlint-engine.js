"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _textlintEngineCore;

function _load_textlintEngineCore() {
    return _textlintEngineCore = _interopRequireDefault(require("./engine/textlint-engine-core"));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var createFormatter = require("textlint-formatter");

/**
 * TextLintEngine a adapter for TextLintEngineCore.
 * It aim to pull the whole look together. (TextLintEngine and TextFixEngine)
 */
var TextLintEngine =
/**
 * TextLintEngine is a adaptor of TextLintEngineCore.
 * @param {Config|Object} [config]
 * @returns {TextLintEngineCore}
 */
function TextLintEngine(config) {
    _classCallCheck(this, TextLintEngine);

    var executor = {
        /**
         * @param {TextLintCore} textlintCore
         * @returns {function()}
         */
        onFile: function onFile(textlintCore) {
            /**
             * Executes the current configuration on an array of file and directory names.
             * TextLintEngine#executeOnFile
             * @param {String} file An array of file and directory names.
             * @returns {TextLintResult[]} The results for all files that were linted.
             */
            return function executeOnFile(file) {
                return textlintCore.lintFile(file);
            };
        },
        /**
         * @param {TextLintCore} textlintCore
         * @returns {function()}
         */
        onText: function onText(textlintCore) {
            /**
             * lint text, and return TextLintResult[]
             * TextLintEngine#executeOnText
             * @param {string} text linting text content
             * @param {string} ext ext is a type for linting. default: ".txt"
             * @returns {TextLintResult[]}
             */
            return function executeOnText(text, ext) {
                return textlintCore.lintText(text, ext);
            };
        },
        /**
         * @param {TextLintFormatterOption} formatterConfig
         */
        onFormat: function onFormat(formatterConfig) {
            // default formatter name: stylish
            if (!formatterConfig.formatterName) {
                formatterConfig.formatterName = "stylish";
            }
            return createFormatter(formatterConfig);
        }
    };
    return new (_textlintEngineCore || _load_textlintEngineCore()).default(config, executor);
};

exports.default = TextLintEngine;
//# sourceMappingURL=textlint-engine.js.map