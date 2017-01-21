// LICENSE : MIT
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.isPluginRuleKey = isPluginRuleKey;
exports.isPresetRuleKey = isPresetRuleKey;
function isPluginRuleKey(key) {
    // @<owner>/<plugin><>rule>
    if (key[0] === "@" && key.indexOf("/textlint-plugin") !== -1) {
        return true;
    }
    // not contain @, but contain /
    // <plugin>/<rule>
    return key[0] !== "@" && key.indexOf("/") !== -1;
}
function isPresetRuleKey(key) {
    if (/^preset/.test(key)) {
        return true;
    }
    // scoped module: @textlint/textlint-rule-preset-foo
    if (key[0] === "@" && key.indexOf("/textlint-rule-preset") !== -1) {
        return true;
    }
    return false;
}
//# sourceMappingURL=config-util.js.map