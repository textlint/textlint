// LICENSE : MIT
"use strict";
/**
 * Check mixed typed messages
 * @param {TextLintMessage[]} messages
 * @returns {TextLintMessage[]} messages
 */

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = checkMixedMessage;
function checkMixedMessage(messages) {
    var typed = Object.create(null);
    messages.forEach(function (message) {
        typed[message.type] = message.type;
    });
    var types = Object.keys(typed);
    if (types.length > 1) {
        throw new Error("Error mixed message types: " + types.join(", ") + ".\nA single rule does a single thing. Should not mixed types in a single rule.\nYou can separate this rule to two rules.");
    }
    return messages;
}
//# sourceMappingURL=check-mixed-message.js.map