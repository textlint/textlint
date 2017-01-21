// LICENSE : MIT
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getProcessorMatchExtension = getProcessorMatchExtension;

var _assert;

function _load_assert() {
    return _assert = _interopRequireDefault(require("assert"));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * find processor with `ext`
 * @param {Processor[]} processors
 * @param {string} ext
 * @returns {Processor}
 */
function getProcessorMatchExtension(processors, ext) {
    var matchProcessors = processors.filter(function (processor) {
        // static availableExtensions() method
        (0, (_assert || _load_assert()).default)(typeof processor.constructor.availableExtensions === "function", "Processor(" + processor.constructor.name + " should have availableExtensions()");
        var extList = processor.constructor.availableExtensions();
        return extList.some(function (targetExt) {
            return targetExt === ext || "." + targetExt === ext;
        });
    });
    if (matchProcessors.length) {
        return matchProcessors[0];
    }
    return null;
}
//# sourceMappingURL=proccesor-helper.js.map