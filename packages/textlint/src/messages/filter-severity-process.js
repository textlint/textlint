// LICENSE : MIT
"use strict";
import SeverityLevel from "../shared/type/SeverityLevel";

/**
 * Filter messages by their severity.
 * @param {TextLintMessage[]} messages
 * @returns {TextLintMessage[]} filtered messages
 */
function filterWarningMessages(messages = []) {
    return messages.filter(message => {
        return message.severity === SeverityLevel.error;
    });
}

/**
 * Pass through all messages.
 * @param {TextLintMessage[]} messages
 * @returns {TextLintMessage[]}
 */
function through(messages = []) {
    return messages;
}

/**
 * Create message filter by config.quiet.
 * @param {Config} config
 * @returns {Function} filter function for messages
 */
export default function createSeverityFilter(config) {
    if (config.quiet) {
        return filterWarningMessages;
    } else {
        return through;
    }
}
