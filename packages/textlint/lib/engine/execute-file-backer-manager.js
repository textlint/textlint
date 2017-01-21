// MIT © 2016 azu
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Promise = require("bluebird");

var ExecuteFileBackerManager = function () {
    /**
     * create MessageProcessManager with backers
     * @param {function()[]} backers
     */
    function ExecuteFileBackerManager() {
        var backers = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

        _classCallCheck(this, ExecuteFileBackerManager);

        this._backers = backers;
    }

    /**
     * @param {AbstractBacker} backer
     */


    _createClass(ExecuteFileBackerManager, [{
        key: "add",
        value: function add(backer) {
            this._backers.push(backer);
        }

        /**
         * @param {AbstractBacker} backer
         */

    }, {
        key: "remove",
        value: function remove(backer) {
            var index = this._backers.indexOf(backer);
            if (index !== -1) {
                this._backers.splice(index, 1);
            }
        }

        /**
         * process `messages` with registered processes
         * @param {string[]} files
         * @param {function(filePath: string):Promise} executeFile
         * @returns {Promise.<TextLintResult[]>}
         */

    }, {
        key: "process",
        value: function process(files, executeFile) {
            var _this = this;

            var unExecutedResults = [];
            var resultPromises = files.filter(function (filePath) {
                var shouldExecute = _this._backers.every(function (backer) {
                    return backer.shouldExecute({ filePath: filePath });
                });
                // add fake unExecutedResults for un-executed file.
                if (!shouldExecute) {
                    unExecutedResults.push(_this._createFakeResult(filePath));
                }
                return shouldExecute;
            }).map(function (filePath) {
                return executeFile(filePath).then(function (result) {
                    _this._backers.forEach(function (backer) {
                        backer.didExecute({ result: result });
                    });
                    return result;
                });
            }).concat(unExecutedResults);
            // wait all resolved, and call afterAll
            return Promise.all(resultPromises).then(function (results) {
                _this._backers.forEach(function (backer) {
                    backer.afterAll();
                });
                return results;
            });
        }

        /**
         * create fake result object
         * @param {string} filePath
         * @returns {TextLintResult}
         * @private
         */

    }, {
        key: "_createFakeResult",
        value: function _createFakeResult(filePath) {
            return {
                filePath: filePath,
                messages: []
            };
        }
    }]);

    return ExecuteFileBackerManager;
}();

exports.default = ExecuteFileBackerManager;
//# sourceMappingURL=execute-file-backer-manager.js.map