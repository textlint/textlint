// MIT © 2016 azu
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _abstructBacker;

function _load_abstructBacker() {
    return _abstructBacker = _interopRequireDefault(require("./abstruct-backer"));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var fileEntryCache = require("file-entry-cache");
var debug = require("debug")("CacheBacker");

var CacheBacker = function (_AbstractBacker) {
    _inherits(CacheBacker, _AbstractBacker);

    /**
     * @param {Config} config
     */
    function CacheBacker(config) {
        _classCallCheck(this, CacheBacker);

        /**
         * @type {boolean}
         */
        var _this = _possibleConstructorReturn(this, (CacheBacker.__proto__ || Object.getPrototypeOf(CacheBacker)).call(this));

        _this.isEnabled = config.cache;
        _this.fileCache = fileEntryCache.create(config.cacheLocation);
        /**
         * @type {string}
         */
        _this.hashOfConfig = config.hash;
        return _this;
    }

    /**
     * @param {string} filePath
     * @returns {boolean}
     */


    _createClass(CacheBacker, [{
        key: "shouldExecute",
        value: function shouldExecute(_ref) {
            var filePath = _ref.filePath;

            if (!this.isEnabled) {
                return true;
            }
            var descriptor = this.fileCache.getFileDescriptor(filePath);
            var meta = descriptor.meta || {};
            // if the config is changed or file is changed, should execute return true
            var isNotChanged = descriptor.changed || meta.hashOfConfig !== this.hashOfConfig;
            debug("Skipping file since hasn't changed: " + filePath);
            return isNotChanged;
        }

        /**
         * @param {TextLintResult} result
         */

    }, {
        key: "didExecute",
        value: function didExecute(_ref2) {
            var result = _ref2.result;

            if (!this.isEnabled) {
                return;
            }
            var filePath = result.filePath;
            var descriptor = this.fileCache.getFileDescriptor(filePath);
            var meta = descriptor.meta || {};
            /*
             * if a file contains messages we don't want to store the file in the cache
             * so we can guarantee that next execution will also operate on this file
             */
            if (result.messages.length > 0) {
                debug("File has problems, skipping it: " + filePath);
                // remove the entry from the cache
                this.fileCache.removeEntry(filePath);
            } else {
                // cache `config.hash`
                meta.hashOfConfig = this.hashOfConfig;
            }
        }

        /**
         * destroy all cache
         */

    }, {
        key: "destroyCache",
        value: function destroyCache() {
            this.fileCache.destroy();
        }
    }, {
        key: "afterAll",
        value: function afterAll() {
            // persist cache
            this.fileCache.reconcile();
        }
    }]);

    return CacheBacker;
}((_abstructBacker || _load_abstructBacker()).default);

exports.default = CacheBacker;
//# sourceMappingURL=cache-backer.js.map