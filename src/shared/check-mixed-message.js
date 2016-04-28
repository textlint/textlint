// LICENSE : MIT
"use strict";
/**
 * Check mixed typed messages
 * @param {TextLintMessage[]} messages
 * @returns {TextLintMessage[]} messages
 */
export default function checkMixedMessage(messages) {
    const typed = Object.create(null);
    messages.forEach(message => {
        typed[message.type] = message.type;
    });
    const types = Object.keys(typed);
    if (types.length > 1) {
        throw new Error(`Error mixed message types: ${types.join(", ")}.
A single rule does a single thing. Should not mixed types in a single rule.
You can separate this rule to two rules.`);
    }
    return messages;
}
