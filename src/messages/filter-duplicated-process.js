// LICENSE : MIT
"use strict";
/**
 * @param {TextLintMessage} aMessage
 * @param {TextLintMessage} bMessage
 */
const isEqualMessage = (aMessage, bMessage) => {
    return aMessage.index === bMessage.index &&
        aMessage.severity === bMessage.severity &&
        aMessage.message === bMessage.message;
};
/**
 * filter duplicated messages
 * @param {TextLintMessage[]} messages
 * @returns {TextLintMessage[]} filtered messages
 */
export default function filterDuplicatedMessages(messages = []) {
    return messages.filter((message, index) => {
        const restMessages = messages.slice(index + 1);
        return !restMessages.some(restMessage => {
            return isEqualMessage(message, restMessage);
        });
    });
}
