// LICENSE : MIT
"use strict";
import CoreTask from "./textlint-core-task";
export default class TaskRunner {
    /**
     * @param {TextLintCoreTask} task
     */
    constructor(task) {
        this.task = task;
    }

    /**
     * Task and return promise
     * @returns {Promise}
     */
    process() {
        return new Promise((resolve, reject) => {
            const messages = [];
            this.task.on(CoreTask.events.message, message => {
                messages.push(message);
            });
            this.task.on(CoreTask.events.error, error => {
                reject(error);
            });
            this.task.on(CoreTask.events.complete, () => {
                this.task.removeAllListeners();
                resolve(messages);
            });
            this.task.process();
        });
    }
}
