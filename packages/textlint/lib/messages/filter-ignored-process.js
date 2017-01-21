// LICENSE : MIT
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.default = filterMessages;

var _MessageType;

function _load_MessageType() {
    return _MessageType = _interopRequireDefault(require("../shared/type/MessageType"));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * the `index` is in the `range` and return true.
 * @param {Number} index
 * @param {Number[]} range
 * @returns {boolean}
 */
var isContainedRange = function isContainedRange(index, range) {
    var _range = _slicedToArray(range, 2),
        start = _range[0],
        end = _range[1];

    return start <= index && index <= end;
};
/**
 * filter messages by ignore messages
 * @param {Object[]} messages
 * @returns {Object[]} filtered messages
 */
function filterMessages() {
    var messages = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

    var lintingMessages = messages.filter(function (message) {
        return message.type === (_MessageType || _load_MessageType()).default.lint;
    });
    var ignoreMessages = messages.filter(function (message) {
        return message.type === (_MessageType || _load_MessageType()).default.ignore;
    });
    // if match, reject the message
    return lintingMessages.filter(function (message) {
        return !ignoreMessages.some(function (ignoreMessage) {
            var isInIgnoringRange = isContainedRange(message.index, ignoreMessage.range);
            if (isInIgnoringRange && ignoreMessage.ignoringRuleId) {
                // "*" is wildcard that match any rule
                if (ignoreMessage.ignoringRuleId === "*") {
                    return true;
                }
                return message.ruleId === ignoreMessage.ignoringRuleId;
            }
            return isInIgnoringRange;
        });
    });
}
//# sourceMappingURL=filter-ignored-process.js.map