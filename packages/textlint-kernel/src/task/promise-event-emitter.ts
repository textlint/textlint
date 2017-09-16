// MIT © 2017 azu
// MIT © 2017 59naga
// https://github.com/59naga/carrack
"use strict";
import { EventEmitter } from "events";
import Promise = require("bluebird");

export class PromiseEventEmitter {
    private events: EventEmitter;

    constructor() {
        this.events = new EventEmitter();
        this.events.setMaxListeners(0)
    }

    listenerCount(type: string | symbol): number {
        return this.events.listenerCount(type);
    }

    on(event: string, listener: (...args: any[]) => void) {
        return this.events.on(event, listener);
    }

    once(event: string, listener: (...args: any[]) => void) {
        if (typeof listener !== "function") {
            throw new TypeError("listener must be a function");
        }

        let fired = false;

        const onceListener = (...args: Array<any>) => {
            this.events.removeListener(event, onceListener);

            if (fired === false) {
                fired = true;
                return listener(...args);
            }
            return undefined;
        };

        // https://github.com/nodejs/node/blob/v4.1.2/lib/events.js#L286
        (onceListener as any).listener = listener;
        this.events.on(event, onceListener);

        return this;
    }

    emit(event: string, ...args: Array<any>) {
        const promises: Array<Promise<void>> = [];

        this.events.listeners(event).forEach(listener => {
            promises.push(listener(...args));
        });

        return Promise.all(promises);
    }
}
