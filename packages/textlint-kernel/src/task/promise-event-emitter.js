// MIT © 2017 azu
// MIT © 2017 59naga
// https://github.com/59naga/carrack
"use strict";
import { EventEmitter } from "events";
import Promise from "bluebird";

export class PromiseEventEmitter extends EventEmitter {
    once(event, listener) {
        if (typeof listener !== "function") {
            throw new TypeError("listener must be a function");
        }

        let fired = false;

        const onceListener = (...args) => {
            this.removeListener(event, onceListener);

            if (fired === false) {
                fired = true;
                return listener(...args);
            }
            return undefined;
        };

        // https://github.com/nodejs/node/blob/v4.1.2/lib/events.js#L286
        onceListener.listener = listener;
        this.on(event, onceListener);

        return this;
    }

    emit(event, ...args) {
        const promises = [];

        this.listeners(event).forEach(listener => {
            promises.push(listener(...args));
        });

        return Promise.all(promises);
    }
}
