// LICENSE : MIT
"use strict";
export function isPluginRuleKey(key) {
    return key.indexOf("/") !== -1;
}
export function isPresetRuleKey(key) {
    return /^preset/.test(key);
}
