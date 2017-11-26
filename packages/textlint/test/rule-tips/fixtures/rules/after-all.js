// MIT © 2017 azu
"use strict";
const callAsync = text => {
    // do something by async
    return Promise.resolve(text);
};
/**
 * @param {Array} array
 * @returns {function(*)}
 */
export const createAfterAllRule = array => {
    return context => {
        const { Syntax, getSource } = context;
        const promiseQueue = [];
        return {
            [Syntax.Str](node) {
                const text = getSource(node);
                // add it to queue
                promiseQueue.push(callAsync(text));
            },
            // call at the end
            // Syntax.Document <-> Syntax.Document:exit
            // https://github.com/textlint/textlint/blob/master/docs/rule.md
            [`${Syntax.Document}:exit`]() {
                // Note: textlint wait for `Promise.all` is resolved.
                return Promise.all(promiseQueue)
                    .then((...responses) => {
                        const textAll = responses.join("");
                        array.push(textAll);
                    })
                    .then(() => {
                        // after-all
                        array.push("after-all");
                    });
            }
        };
    };
};
