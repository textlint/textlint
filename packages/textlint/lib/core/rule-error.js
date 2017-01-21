// LICENSE : MIT
"use strict";
/**
 * @typedef {Object} RuleError~Padding
 * @property {number} line
 * @property {number} column
 * @property {Object} fix
 */

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var RuleError = function () {
  /**
   * RuleError is like Error object.
   * It's used for adding to TextLintResult.
   * @param {string} message error message should start with lowercase letter
   * @param {RuleError~Padding|number} [paddingLocation] - the object has padding {line, column} for actual error reason
   * @constructor
   */
  function RuleError(message, paddingLocation) {
    _classCallCheck(this, RuleError);

    this.message = message;
    if ((typeof paddingLocation === "undefined" ? "undefined" : _typeof(paddingLocation)) === "object") {
      /**
       * padding lineNumber
       * @type {number}
       */
      this.line = paddingLocation.line;
      /**
       * padding column
       * @type {number}
       */
      this.column = paddingLocation.column;
      /**
       * padding index
       * @type {number}
       */
      this.index = paddingLocation.index;
      /**
       * fixCommand object
       * @type {FixCommand}
       */
      this.fix = paddingLocation.fix;
    } else if (typeof paddingLocation === "number") {
      // this is deprecated
      // should pass padding as object.
      this.column = paddingLocation;
    }
  }

  _createClass(RuleError, [{
    key: "toString",
    value: function toString() {
      return JSON.stringify({
        line: this.line,
        column: this.column,
        index: this.index,
        fix: this.fix
      });
    }
  }]);

  return RuleError;
}();

module.exports = RuleError;
//# sourceMappingURL=rule-error.js.map