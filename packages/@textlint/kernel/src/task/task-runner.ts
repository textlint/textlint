// LICENSE : MIT
"use strict";
import CoreTask, {
    default as TextLintCoreTask,
    IgnoreReportedMessage,
    LintReportedMessage
} from "./textlint-core-task";

export default class TaskRunner {
    /**
     * Task and return promise
     * @param {TextLintCoreTask} task
     * @returns {Promise}
     */
    static process(task: TextLintCoreTask): Promise<Array<LintReportedMessage | IgnoreReportedMessage>> {
        return new Promise((resolve, reject) => {
            const messages: Array<LintReportedMessage | IgnoreReportedMessage> = [];
            task.on(CoreTask.events.message, (message) => {
                messages.push(message);
            });
            task.on(CoreTask.events.error, (error) => {
                reject(error);
            });
            task.on(CoreTask.events.complete, () => {
                task.removeAllListeners();
                resolve(messages);
            });
            task.start();
        });
    }

    /**
     * Task and return messages
     * @param {TextLintCoreTask} task
     * @returns messages
     */
    static processSync(task: TextLintCoreTask): Array<LintReportedMessage | IgnoreReportedMessage> {
        const messages: Array<LintReportedMessage | IgnoreReportedMessage> = [];

        let taskError: Error | undefined;

        task.on(CoreTask.events.message, (message) => {
            messages.push(message);
        });
        task.on(CoreTask.events.error, (error) => {
            taskError = error;
        });
        task.on(CoreTask.events.complete, () => {
            task.removeAllListeners();
        });
        task.startSync();

        if (taskError) {
            throw taskError;
        }

        return messages;
    }
}
