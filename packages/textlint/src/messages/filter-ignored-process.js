// LICENSE : MIT
"use strict";
import MessageType from "../shared/type/MessageType";
/**
 * the `index` is in the `range` and return true.
 * @param {Number} index
 * @param {Number[]} range
 * @returns {boolean}
 */
const isContainedRange = (index, range) => {
    const [start, end] = range;
    return start <= index && index <= end;
};
/**
 * filter messages by ignore messages
 * @param {Object[]} messages
 * @returns {Object[]} filtered messages
 */
export default function filterMessages(messages = []) {
    const lintingMessages = messages.filter(message => {
        return message.type === MessageType.lint;
    });
    const ignoreMessages = messages.filter(message => {
        return message.type === MessageType.ignore;
    });
    // if match, reject the message
    return lintingMessages.filter(message => {
        return !ignoreMessages.some(ignoreMessage => {
            const isInIgnoringRange = isContainedRange(message.index, ignoreMessage.range);
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
