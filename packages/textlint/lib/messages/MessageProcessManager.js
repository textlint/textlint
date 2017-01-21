// LICENSE : MIT
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MessageProcessManager = function () {
    /**
     * create MessageProcessManager with processes
     * @param {function(messages: Array)[]} processes
     */
    function MessageProcessManager() {
        var processes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

        _classCallCheck(this, MessageProcessManager);

        this._processors = processes;
    }

    _createClass(MessageProcessManager, [{
        key: "add",
        value: function add(process) {
            this._processors.push(process);
        }
    }, {
        key: "remove",
        value: function remove(process) {
            var index = this._processors.indexOf(process);
            if (index !== -1) {
                this._processors.splice(index, 1);
            }
        }

        /**
         * process `messages` with registered processes
         * @param {TextLintMessage[]} messages
         * @returns {TextLintMessage[]}
         */

    }, {
        key: "process",
        value: function process(messages) {
            var originalMessages = messages;
            if (this._processors === 0) {
                return originalMessages;
            }
            return this._processors.reduce(function (messages, filter) {
                return filter(messages);
            }, originalMessages);
        }
    }]);

    return MessageProcessManager;
}();

exports.default = MessageProcessManager;
//# sourceMappingURL=MessageProcessManager.js.map