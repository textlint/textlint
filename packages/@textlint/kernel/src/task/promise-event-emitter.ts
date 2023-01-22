// MIT © 2017 azu
// MIT © 2017 59naga
// https://github.com/59naga/carrack
"use strict";

export type Listener = (...args: any[]) => void;

export class EventEmitter<T extends Listener = Listener> {
    #listeners = new Map<string, Set<T>>();

    on(type: string, listener: T): void {
        const prevSet = this.#listeners.get(type);
        const listenerSet = prevSet ?? new Set<T>();
        listenerSet?.add(listener);
        this.#listeners.set(type, listenerSet);
    }

    emit(type: string, ...args: any[]): void {
        const listenerSet = this.#listeners.get(type);
        if (!listenerSet) {
            return;
        }
        for (const listenerSetElement of listenerSet) {
            listenerSetElement(...args);
        }
    }

    off(type: string, listener: T): void {
        const listenerSet = this.#listeners.get(type);
        if (!listenerSet) {
            return;
        }
        for (const listenerSetElement of listenerSet) {
            if (listenerSetElement === listener) {
                listenerSet.delete(listener);
            }
        }
    }

    removeAllListeners(): void {
        this.#listeners.clear();
    }

    listenerCount(type: string): number {
        return this.#listeners.get(type)?.size ?? 0;
    }

    listeners(type: string): T[] {
        return Array.from(this.#listeners.get(type) ?? []);
    }
}

export class PromiseEventEmitter {
    private events: EventEmitter<(...args: any[]) => Promise<void> | void>;

    constructor() {
        this.events = new EventEmitter();
    }

    listenerCount(type: string): number {
        return this.events.listenerCount(type);
    }

    on(event: string, listener: (...args: any[]) => Promise<void> | void) {
        return this.events.on(event, listener);
    }

    emit(event: string, ...args: any[]): Promise<void[]> {
        const promises: (Promise<void> | void)[] = [];

        this.events.listeners(event).forEach((listener) => {
            promises.push(listener(...args));
        });

        return Promise.all(promises);
    }
}
