// LICENSE : MIT
"use strict";
import SeverityLevel from "../shared/type/SeverityLevel";
import { TextlintKernelConstructorOptions, TextLintMessage } from "../textlint-kernel-interface";

/**
 * Filter messages by their severity.
 * @param {TextLintMessage[]} messages
 * @returns {TextLintMessage[]} filtered messages
 */
export function filterWarningMessages(messages: TextLintMessage[] = []) {
    return messages.filter(message => {
        return message.severity === SeverityLevel.error;
    });
}

/**
 * Pass through all messages.
 * @param {TextLintMessage[]} messages
 * @returns {TextLintMessage[]}
 */
export function through(messages = []) {
    return messages;
}

/**
 * Create message filter by config.quiet.
 * @param {Config} config
 * @returns {Function} filter function for messages
 */
export default function createSeverityFilter(config: TextlintKernelConstructorOptions) {
    if (config.quiet) {
        return filterWarningMessages;
    } else {
        return through;
    }
}
