// LICENSE : MIT
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MapLike = require("map-like");
/**
 * Processor Map object
 */

var ProcessorMap = function (_MapLike) {
    _inherits(ProcessorMap, _MapLike);

    function ProcessorMap() {
        _classCallCheck(this, ProcessorMap);

        return _possibleConstructorReturn(this, (ProcessorMap.__proto__ || Object.getPrototypeOf(ProcessorMap)).apply(this, arguments));
    }

    _createClass(ProcessorMap, [{
        key: "toJSON",
        value: function toJSON() {
            var object = {};
            this.forEach(function (value, key) {
                object[key] = value;
            });
            return object;
        }
    }]);

    return ProcessorMap;
}(MapLike);

exports.default = ProcessorMap;
//# sourceMappingURL=processor-map.js.map