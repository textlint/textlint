// MIT © 2017 azu
"use strict";

import { TextlintRuleContext, TextlintRuleReportHandler } from "@textlint/types";

const callAsync = (text: string) => {
    // do something by async
    return Promise.resolve(text);
};

export const createAfterAllRule = (array: string[]) => {
    return (context: TextlintRuleContext): TextlintRuleReportHandler => {
        const { Syntax, getSource } = context;
        const promiseQueue: Promise<String>[] = [];
        return {
            [Syntax.Str](node) {
                const text = getSource(node);
                // add it to queue
                promiseQueue.push(callAsync(text));
            },
            // call at the end
            // Syntax.Document <-> Syntax.Document:exit
            // https://github.com/textlint/textlint/blob/master/docs/rule.md
            async [`${Syntax.Document}:exit`]() {
                // Note: textlint wait for `Promise.all` is resolved.
                const responses = await Promise.all(promiseQueue);
                const textAll = responses.join("");
                array.push(textAll);
                // after-all
                array.push("after-all");
            }
        };
    };
};
