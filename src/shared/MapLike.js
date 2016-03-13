// LICENSE : MIT
"use strict";
/*
    ES6 Map like object.
    This is not iterable.
 */
export default class MapLike {
    constructor() {
        this._store = Object.create(null);
    }

    /**
     * @returns {Object}
     */
    toJSON() {
        return this._store;
    }

    /**
     * get keys
     * @returns {Array}
     */
    keys() {
        return Object.keys(this._store);
    }

    /**
     * get values
     * @returns {Array}
     */
    values() {
        /* eslint-disable guard-for-in */
        const stores = this._store;
        const results = [];
        for (const value in stores) {
            results.push(value);
        }
        return results;
        /* eslint-enable guard-for-in */
    }

    /**
     * @param {string} key
     * @returns {*}
     */
    get(key) {
        return this._store[key];
    }


    /**
     * has value of key
     * @param key
     * @returns {boolean}
     */
    has(key) {
        return this.get(key) != null;
    }


    /**
     * set value for key
     * @param {string} key
     * @param {*} value
     */
    set(key, value) {
        this._store[key] = value;
    }

    /**
     * clear defined key,value
     */
    clear() {
        this._store = Object.create(null);
    }
}
