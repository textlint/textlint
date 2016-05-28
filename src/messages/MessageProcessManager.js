// LICENSE : MIT
"use strict";
export default class MessageProcessManager {
    /**
     * create MessageProcessManager with processes
     * @param {function(messages: Array)[]} processes
     */
    constructor(processes = []) {
        this._processes = processes;
    }

    add(process) {
        this._processes.push(process);
    }

    remove(process) {
        const index = this._processes.indexOf(process);
        if (index !== -1) {
            this._processes.splice(index, 1);
        }
    }

    /**
     * process `messages` with registered processes
     * @param {TextLintMessage[]} messages
     * @returns {TextLintMessage[]}
     */
    process(messages) {
        const originalMessages = messages;
        if (this._processes === 0) {
            return originalMessages;
        }
        return this._processes.reduce((messages, filter) => {
            return filter(messages);
        }, originalMessages);
    }
}
