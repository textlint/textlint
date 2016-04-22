// LICENSE : MIT
"use strict";
/**
 * filter messages by ignore messages
 * @param messages
 * @returns {*}
 */
export default function filerMessages(messages = []) {
    const lintingMessages = messages.filter(message => {
        return message.type === "lint" || message.type === "fix";
    });
    const ignoreMessages = messages.filter(message => {
        return message.type === "ignore";
    });
    if (lintingMessages.length === 0 || ignoreMessages.length === 0) {
        return messages;
    }
    return lintingMessages.filter(message => {
        return !ignoreMessages.some(ignoreMessage => {
            const index = message.index;
            const [start, end] = ignoreMessage.ignoreRange;
            return start <= index && index <= end;
        });
    });
}
