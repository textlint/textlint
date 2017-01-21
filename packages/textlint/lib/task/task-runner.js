// LICENSE : MIT
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _textlintCoreTask;

function _load_textlintCoreTask() {
    return _textlintCoreTask = _interopRequireDefault(require("./textlint-core-task"));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TaskRunner = function () {
    function TaskRunner() {
        _classCallCheck(this, TaskRunner);
    }

    _createClass(TaskRunner, null, [{
        key: "process",

        /**
         * Task and return promise
         * @param {TextLintCoreTask} task
         * @returns {Promise}
         */
        value: function process(task) {
            return new Promise(function (resolve, reject) {
                var messages = [];
                task.on((_textlintCoreTask || _load_textlintCoreTask()).default.events.message, function (message) {
                    messages.push(message);
                });
                task.on((_textlintCoreTask || _load_textlintCoreTask()).default.events.error, function (error) {
                    reject(error);
                });
                task.on((_textlintCoreTask || _load_textlintCoreTask()).default.events.complete, function () {
                    task.removeAllListeners();
                    resolve(messages);
                });
                task.start();
            });
        }
    }]);

    return TaskRunner;
}();

exports.default = TaskRunner;
//# sourceMappingURL=task-runner.js.map