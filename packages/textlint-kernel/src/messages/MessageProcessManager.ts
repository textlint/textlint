// LICENSE : MIT
"use strict";
import { TextLintMessage } from "../textlint-kernel-interface";

export type MessageProcessor = (messages: TextLintMessage[]) => TextLintMessage[];

export default class MessageProcessManager {
    private _processors: MessageProcessor[];

    /**
     * create MessageProcessManager with processes
     * @param {function(messages: Array)[]} [processes]
     */
    constructor(processes: MessageProcessor[] = []) {
        this._processors = processes;
    }

    add(messageProcessor: MessageProcessor) {
        this._processors.push(messageProcessor);
    }

    remove(process: MessageProcessor) {
        const index = this._processors.indexOf(process);
        if (index !== -1) {
            this._processors.splice(index, 1);
        }
    }

    /**
     * process `messages` with registered processes
     * @param {TextLintMessage[]} messages
     * @returns {TextLintMessage[]}
     */
    process(messages: TextLintMessage[]): TextLintMessage[] {
        const originalMessages = messages;
        if (this._processors.length === 0) {
            return originalMessages;
        }
        return this._processors.reduce((messages, filter) => {
            return filter(messages);
        }, originalMessages);
    }
}
