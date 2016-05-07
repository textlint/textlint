// LICENSE : MIT
"use strict";
import MessageType from "./type/MessageType";
/**
 * filter messages by ignore messages
 * @param {Object[]} messages
 * @returns {Object[]} filtered messages
 */
export function filterMessages(messages = []) {
    const lintingMessages = messages.filter(message => {
        return message.type === MessageType.lint;
    });
    const ignoreMessages = messages.filter(message => {
        return message.type === MessageType.ignore;
    });
    return lintingMessages.filter(message => {
        return !ignoreMessages.some(ignoreMessage => {
            const index = message.index;
            const [start, end] = ignoreMessage.range;
            return start <= index && index <= end;
        });
    });
}
