// LICENSE : MIT
"use strict";
export default class FilterMachine {
    constructor() {
        this._filters = [];
    }

    addFilter(filter) {
        this._filters.push(filter);
    }

    removeFilter(filter) {
        const index = this._filters.indexOf(filter);
        if (index !== -1) {
            this._filters.splice(index, 1);
        }
    }

    filter(messages) {
        const originalMessages = messages;
        if (this._filters === 0) {
            return originalMessages;
        }
        return this._filters.reduce((messages, filter) => {
            return messages.filter(filter);
        }, originalMessages);
    }
}
