// LICENSE : MIT
"use strict";

var _cli;

function _load_cli() {
    return _cli = _interopRequireDefault(require("./cli"));
}

var _textlint;

function _load_textlint() {
    return _textlint = _interopRequireDefault(require("./textlint"));
}

var _textlintEngine;

function _load_textlintEngine() {
    return _textlintEngine = _interopRequireDefault(require("./textlint-engine"));
}

var _textfixEngine;

function _load_textfixEngine() {
    return _textfixEngine = _interopRequireDefault(require("./textfix-engine"));
}

var _textlintCore;

function _load_textlintCore() {
    return _textlintCore = _interopRequireDefault(require("./textlint-core"));
}

var _MessageType;

function _load_MessageType() {
    return _MessageType = _interopRequireDefault(require("./shared/type/MessageType"));
}

var _SeverityLevel;

function _load_SeverityLevel() {
    return _SeverityLevel = _interopRequireDefault(require("./shared/type/SeverityLevel"));
}

var _TextLintNodeType;

function _load_TextLintNodeType() {
    return _TextLintNodeType = _interopRequireDefault(require("./shared/type/TextLintNodeType"));
}

var _throwLog;

function _load_throwLog() {
    return _throwLog = _interopRequireWildcard(require("./util/throw-log"));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Level of abstraction(descending order)
// cli > TextLintEngine > TextLintCore(textlint)
// See: https://github.com/textlint/textlint/blob/master/docs/use-as-modules.md
module.exports = {
    // Command line interface
    cli: (_cli || _load_cli()).default,
    // TextLintEngine is a wrapper around `textlint` for linting **multiple** files
    // include formatter, detecting utils
    // <Recommend>: It is easy to use
    // You can see engine/textlint-engine-core.js for more detail
    TextLintEngine: (_textlintEngine || _load_textlintEngine()).default,
    // TextFixEngine is a wrapper around `textlint` for linting **multiple** files
    // include formatter, detecting utils
    // <Recommend>: It is easy to use
    // You can see engine/textlint-engine-core.js for more detail
    TextFixEngine: (_textfixEngine || _load_textfixEngine()).default,
    // It is a singleton object of TextLintCore
    // Recommend: use TextLintCore
    textlint: (_textlint || _load_textlint()).default,
    // Core API for linting a **single** text or file.
    TextLintCore: (_textlintCore || _load_textlintCore()).default,
    // Constant Types
    TextLintMessageType: (_MessageType || _load_MessageType()).default,
    TextLintMessageSeverityLevel: (_SeverityLevel || _load_SeverityLevel()).default,
    TextLintNodeType: (_TextLintNodeType || _load_TextLintNodeType()).default,
    // for debug, don't use direct
    // It is used in textlint-tester
    _logger: _throwLog || _load_throwLog()
};
//# sourceMappingURL=index.js.map