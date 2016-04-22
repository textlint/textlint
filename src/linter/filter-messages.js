// LICENSE : MIT
"use strict";
export default function filerMessages(messages = [], ignoreMessages = []) {
    if (messages.length === 0 || ignoreMessages.length === 0) {
        return messages;
    }
    return messages.filter(message => {
        return !ignoreMessages.some(ignoreMessage => {
            const index = message.index;
            const [start, end] = ignoreMessage.ignoreRange;
            return start <= index && index <= end;
        });
    });
}
