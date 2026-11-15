// MIT © 2017 azu
// MIT © 2017 59naga
// https://github.com/59naga/carrack
"use strict";

export type Listener = (...args: unknown[]) => void;

export class EventEmitter<T extends Listener = Listener> {
    private _listeners = new Map<string, Set<T>>();

    on(type: string, listener: T): void {
        const prevSet = this._listeners.get(type);
        const listenerSet = prevSet ?? new Set<T>();
        listenerSet?.add(listener);
        this._listeners.set(type, listenerSet);
    }

    emit(type: string, ...args: unknown[]): void {
        const listenerSet = this._listeners.get(type);
        if (!listenerSet) {
            return;
        }
        for (const listenerSetElement of listenerSet) {
            listenerSetElement(...args);
        }
    }

    off(type: string, listener: T): void {
        const listenerSet = this._listeners.get(type);
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
        this._listeners.clear();
    }

    listenerCount(type: string): number {
        return this._listeners.get(type)?.size ?? 0;
    }

    listenerSet(type: string): Set<T> | undefined {
        const set = this._listeners.get(type);
        return set !== undefined && set.size > 0 ? set : undefined;
    }

    listeners(type: string): T[] {
        return Array.from(this._listeners.get(type) ?? []);
    }
}

export class PromiseEventEmitter {
    private events: EventEmitter<(...args: unknown[]) => Promise<void> | void>;

    constructor() {
        this.events = new EventEmitter();
    }

    listenerCount(type: string): number {
        return this.events.listenerCount(type);
    }

    on(event: string, listener: (...args: unknown[]) => Promise<void> | void) {
        return this.events.on(event, listener);
    }

    /**
     * Call the listeners of `event` with `arg`.
     * It is called for every node of the AST, so it does not allocate when no listener returns a promise.
     * @returns a promise of all the promises that the listeners returned, or `undefined` when none of them returned a promise
     */
    emit(event: string, arg: unknown): Promise<unknown[]> | undefined {
        const listenerSet = this.events.listenerSet(event);
        if (listenerSet === undefined) {
            return undefined;
        }
        let promises: unknown[] | undefined;
        for (const listener of listenerSet) {
            const result = listener(arg);
            if (result != null && typeof (result as PromiseLike<void>).then === "function") {
                (promises ??= []).push(result);
            }
        }
        return promises === undefined ? undefined : Promise.all(promises);
    }
}
