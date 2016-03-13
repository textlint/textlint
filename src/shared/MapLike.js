// LICENSE : MIT
"use strict";
const assert = require("assert");
/*
    ES6 Map like object.
    This is not iterable.
 */
export default class MapLike {
    constructor(entries = []) {
        this._store = Object.create(null);
        entries.forEach(entry => {
            assert(Array.isArray(entry), "new MapLike([ [key, value] ])");
            this.set(entry[0], entry[1]);
        });
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
        const keys = this.keys();
        const store = this._store;
        const results = [];
        keys.forEach(key => {
            results.push(store[key]);
        });
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
     * @return {MapLike}
     */
    set(key, value) {
        this._store[key] = value;
        return this;
    }

    /**
     * clear defined key,value
     * @returns {MapLike}
     */
    clear() {
        this._store = Object.create(null);
        return this;
    }
}
