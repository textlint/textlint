"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _textlintEngineCore;

function _load_textlintEngineCore() {
    return _textlintEngineCore = _interopRequireDefault(require("./engine/textlint-engine-core"));
}

var _textfixFormatter;

function _load_textfixFormatter() {
    return _textfixFormatter = _interopRequireDefault(require("./fixer/textfix-formatter"));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * TextFixEngine a adapter for TextLintEngineCore.
 * It aim to pull the whole look together. (TextLintEngine and TextFixEngine)
 */
var TextFixEngine =
/**
 * TextFixEngine is a adaptor of TextLintEngineCore.
 * @param {Config|Object} [config]
 * @returns {TextLintEngineCore}
 */
function TextFixEngine(config) {
    _classCallCheck(this, TextFixEngine);

    var executor = {
        /**
         * @param {TextLintCore} textlintCore
         * @returns {function()}
         */
        onFile: function onFile(textlintCore) {
            /**
             * Fixes the current configuration on an array of file and directory names.
             * TextFixEngine#executeOnFiles
             * @param {String[]}  files An array of file and directory names.
             * @returns {TextLintFixResult[]} The results for all files that were linted.
             */
            return function (file) {
                return textlintCore.fixFile(file);
            };
        },
        /**
         * @param {TextLintCore} textlintCore
         * @returns {function()}
         */
        onText: function onText(textlintCore) {
            /**
             * Fix texts with ext option.
             * TextFixEngine#executeOnText
             * @param {string} text linting text content
             * @param {string} ext ext is a type for linting. default: ".txt"
             * @returns {TextLintFixResult[]}
             */
            return function (text, ext) {
                return textlintCore.fixText(text, ext);
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
            return (0, (_textfixFormatter || _load_textfixFormatter()).default)(formatterConfig);
        }
    };
    return new (_textlintEngineCore || _load_textlintEngineCore()).default(config, executor);
};

exports.default = TextFixEngine;
//# sourceMappingURL=textfix-engine.js.map