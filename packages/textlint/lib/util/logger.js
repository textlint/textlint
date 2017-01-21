// LICENSE : MIT
"use strict";

/* eslint-disable no-console */

/**
 * Logger Utils class
 * Use this instead of `console.log`
 * Main purpose for helping linting.
 */

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Logger = function () {
    function Logger() {
        _classCallCheck(this, Logger);
    }

    _createClass(Logger, null, [{
        key: "log",
        value: function log() {
            var _console;

            (_console = console).log.apply(_console, arguments);
        }
    }, {
        key: "warn",
        value: function warn() {
            var _console2;

            (_console2 = console).warn.apply(_console2, arguments);
        }
    }, {
        key: "error",
        value: function error() {
            var _console3;

            (_console3 = console).error.apply(_console3, arguments);
        }
    }]);

    return Logger;
}();

/* eslint-enable no-console */


exports.default = Logger;
//# sourceMappingURL=logger.js.map