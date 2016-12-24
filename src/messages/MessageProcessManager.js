// LICENSE : MIT
"use strict";
export default class MessageProcessManager {
    /**
     * create MessageProcessManager with processes
     * @param {function(messages: Array)[]} processes
     */
    constructor(processes = []) {
        this._processors = processes;
    }

    add(process) {
        this._processors.push(process);
    }

    remove(process) {
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
    process(messages) {
        const originalMessages = messages;
        if (this._processors === 0) {
            return originalMessages;
        }
        return this._processors.reduce((messages, filter) => {
            return filter(messages);
        }, originalMessages);
    }
}
