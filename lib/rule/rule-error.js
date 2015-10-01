// LICENSE : MIT
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var RuleError = (function () {
    /**
     * RuleError is like Error object.
     * It's used for adding to TextLintResult.
     * @param {string} message error message should start with lowercase letter
     * @param {object?} paddingLocation - the object has padding {line, column} for actual error reason
     * @constructor
     */

    function RuleError(message, paddingLocation) {
        _classCallCheck(this, RuleError);

        this.message = message;
        if (typeof paddingLocation === 'object') {
            this.line = paddingLocation.line;
            // start with 0
            this.column = paddingLocation.column; // start with 0
        } else if (typeof paddingLocation === 'number') {
                // this is deprecated
                // should pass padding as object.
                this.column = paddingLocation;
            }
    }

    _createClass(RuleError, [{
        key: 'toString',
        value: function toString() {
            return this.column + ':' + this.line + ':<RuleError>' + this.message + ' @:' + (this.line ? this.line + ':' : '') + (this.column ? this.column + ':' : '');
        }
    }]);

    return RuleError;
})();

module.exports = RuleError;
//# sourceMappingURL=rule-error.js.map