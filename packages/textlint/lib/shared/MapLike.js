// LICENSE : MIT
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var assert = require("assert");
/*
    ES6 Map like object.
    This is not iterable.
 */

var MapLike = function () {
    function MapLike() {
        var _this = this;

        var entries = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

        _classCallCheck(this, MapLike);

        this._store = Object.create(null);
        entries.forEach(function (entry) {
            assert(Array.isArray(entry), "new MapLike([ [key, value] ])");
            _this.set(entry[0], entry[1]);
        });
    }

    /**
     * @returns {Object}
     */


    _createClass(MapLike, [{
        key: "toJSON",
        value: function toJSON() {
            return this._store;
        }

        /**
         * get keys
         * @returns {Array}
         */

    }, {
        key: "keys",
        value: function keys() {
            return Object.keys(this._store);
        }

        /**
         * get values
         * @returns {Array}
         */

    }, {
        key: "values",
        value: function values() {
            /* eslint-disable guard-for-in */
            var keys = this.keys();
            var store = this._store;
            var results = [];
            keys.forEach(function (key) {
                results.push(store[key]);
            });
            return results;
            /* eslint-enable guard-for-in */
        }

        /**
         * @param {string} key
         * @returns {*}
         */

    }, {
        key: "get",
        value: function get(key) {
            return this._store[key];
        }

        /**
         * has value of key
         * @param key
         * @returns {boolean}
         */

    }, {
        key: "has",
        value: function has(key) {
            return this.get(key) != null;
        }

        /**
         * set value for key
         * @param {string} key
         * @param {*} value
         * @return {MapLike}
         */

    }, {
        key: "set",
        value: function set(key, value) {
            this._store[key] = value;
            return this;
        }

        /**
         * clear defined key,value
         * @returns {MapLike}
         */

    }, {
        key: "clear",
        value: function clear() {
            this._store = Object.create(null);
            return this;
        }
    }]);

    return MapLike;
}();

exports.default = MapLike;
module.exports = exports["default"];
//# sourceMappingURL=MapLike.js.map