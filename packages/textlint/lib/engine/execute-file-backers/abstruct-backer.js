// MIT © 2016 azu
"use strict";
/* eslint-disable */

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AbstractBacker = function () {
  function AbstractBacker() {
    _classCallCheck(this, AbstractBacker);
  }

  _createClass(AbstractBacker, [{
    key: "shouldExecute",

    /**
     * @param {string} filePath
     * @returns {boolean}
     */
    value: function shouldExecute(_ref) {
      var filePath = _ref.filePath;

      return true;
    }

    /**
     * @param {TextLintResult} result
     * @returns {boolean}
     */

  }, {
    key: "didExecute",
    value: function didExecute(_ref2) {
      var result = _ref2.result;

      return true;
    }

    /**
     * call when after all execution is completed
     */

  }, {
    key: "afterAll",
    value: function afterAll() {}
  }]);

  return AbstractBacker;
}();

exports.default = AbstractBacker;
//# sourceMappingURL=abstruct-backer.js.map