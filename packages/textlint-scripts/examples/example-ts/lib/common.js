"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = _default;
var _prh = require("prh");
var _path = _interopRequireDefault(require("path"));
function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}
function _default(text) {
    var dict =
        "version: 1\nrules:\n  - expected: jQuery\n    specs:\n      - from: jquery\n        to:   jQuery\n      - from: \uFF2A\uFF31\uFF35\uFF25\uFF32\uFF39\n        to:   jQuery\n";
    var engine = (0, _prh.fromYAML)("", dict);
    return engine.makeChangeSet("", text);
}
//# sourceMappingURL=common.js.map
