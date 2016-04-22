// LICENSE : MIT
"use strict";
import CoreTask from "./textlint-core-task";
export default class TaskRunner {
    /**
     * Task and return promise
     * @param {TextLintCoreTask} task
     * @returns {Promise}
     */
    static process(task) {
        return new Promise((resolve, reject) => {
            const messages = [];
            const ignoreMessages = [];
            task.on(CoreTask.events.message, message => {
                messages.push(message);
            });
            task.on(CoreTask.events.ignore, ignoreMessage => {
                ignoreMessages.push(ignoreMessage);
            });
            task.on(CoreTask.events.error, error => {
                reject(error);
            });
            task.on(CoreTask.events.complete, () => {
                task.removeAllListeners();
                resolve({
                    messages,
                    ignoreMessages
                });
            });
            task.start();
        });
    }
}
