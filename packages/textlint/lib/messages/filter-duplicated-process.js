// LICENSE : MIT
"use strict";
/**
 * @param {TextLintMessage} aMessage
 * @param {TextLintMessage} bMessage
 */

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = filterDuplicatedMessages;
var isEqualMessage = function isEqualMessage(aMessage, bMessage) {
    return aMessage.index === bMessage.index && aMessage.severity === bMessage.severity && aMessage.message === bMessage.message;
};
/**
 * filter duplicated messages
 * @param {TextLintMessage[]} messages
 * @returns {TextLintMessage[]} filtered messages
 */
function filterDuplicatedMessages() {
    var messages = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

    return messages.filter(function (message, index) {
        var restMessages = messages.slice(index + 1);
        return !restMessages.some(function (restMessage) {
            return isEqualMessage(message, restMessage);
        });
    });
}
//# sourceMappingURL=filter-duplicated-process.js.map