// LICENSE : MIT
"use strict";
import type { TextlintMessage } from "@textlint/types";
import { TextlintKernelConstructorOptions } from "../textlint-kernel-interface.js";
import { TextlintRuleSeverityLevelKeys } from "../context/TextlintRuleSeverityLevelKeys.js";

/**
 * Filter messages by their severity.
 * When quiet mode is enabled, only show error messages (severity 2).
 * @param {TextlintMessage[]} messages
 * @returns {TextlintMessage[]} filtered messages
 */
export function filterWarningMessages(messages: TextlintMessage[] = []) {
    return messages.filter((message) => {
        return message.severity === TextlintRuleSeverityLevelKeys.error;
    });
}

/**
 * Pass through all messages.
 * @param {TextlintMessage[]} messages
 * @returns {TextlintMessage[]}
 */
export function through<T>(messages: T[] = []): T[] {
    return messages;
}

/**
 * Create message filter by config.quiet.
 * @param {Config} config
 * @returns {(...args: any[]) => any} filter function for messages
 */
export default function createSeverityFilter(
    config: TextlintKernelConstructorOptions
): (messages: TextlintMessage[]) => TextlintMessage[] {
    if (config.quiet) {
        return filterWarningMessages;
    } else {
        return through;
    }
}
