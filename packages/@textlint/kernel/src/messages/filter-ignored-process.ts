// LICENSE : MIT
"use strict";
import MessageType from "../shared/type/MessageType";
import { IgnoreReportedMessage, LintReportedMessage } from "../task/textlint-core-task";

/**
 * the `index` is in the `range` and return true.
 * @param {Number} index
 * @param {Number[]} range
 * @returns {boolean}
 */
const isContainedRange = ({
    range,
    ignoredRange
}: {
    range: readonly [number, number];
    ignoredRange: readonly [number, number];
}) => {
    const [start, end] = ignoredRange;
    return start <= range[0] && range[1] <= end;
};
/**
 * filter messages by ignore messages
 * @param {Object[]} messages
 * @returns {Object[]} filtered messages
 */
export default function filterMessages(messages: ReadonlyArray<LintReportedMessage | IgnoreReportedMessage> = []) {
    const lintingMessages = messages.filter((message) => {
        return message.type === MessageType.lint;
    }) as LintReportedMessage[];
    const ignoreMessages = messages.filter((message) => {
        return message.type === MessageType.ignore;
    }) as IgnoreReportedMessage[];
    // if match, reject the message
    return lintingMessages.filter((message) => {
        return !ignoreMessages.some((ignoreMessage) => {
            const isInIgnoringRange = isContainedRange({ range: message.range, ignoredRange: ignoreMessage.range });
            if (isInIgnoringRange && ignoreMessage.ignoringRuleId) {
                // "*" is wildcard that match any rule
                if (ignoreMessage.ignoringRuleId === "*") {
                    return true;
                }
                // compare normalized key path
                return message.ruleId === ignoreMessage.ignoringRuleId;
            }
            return isInIgnoringRange;
        });
    });
}
