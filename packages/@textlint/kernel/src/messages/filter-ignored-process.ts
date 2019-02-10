// LICENSE : MIT
"use strict";
import MessageType from "../shared/type/MessageType";
import { IgnoreReportedMessage, LintReportedMessage } from "../task/textlint-core-task";

/**
 * the `index` is in the `range` and return true.
 * @param {Number} index
 * @param {Number[]} range
 * @returns {boolean}
 */
const isContainedRange = (index: number, range: [number, number]) => {
    const [start, end] = range;
    return start <= index && index <= end;
};

// TODO: share code

// @org/preset/@org/rule
const patternOrgXOrg = /^(@.*?\/.*?)\/(@.*?\/.*?)$/;
// @org/preset/rule
const patternOrgXRule = /^(@.*?\/.*?)\/(.*?)$/;
// preset/@org/rule
const patternPresetXOrg = /^(.*?)\/(@.*?)$/;
// preset/rule
const patternPresetXRule = /^([^@].*?)\/(.*?)$/;
/**
 * split "preset/rule" string to {preset, rule}
 */
export const splitKeyToPresetSubRule = (name: string): { preset: string | null; rule: string } => {
    const patternList = [patternOrgXOrg, patternOrgXRule, patternPresetXOrg, patternPresetXRule];
    for (let i = 0; i < patternList.length; i++) {
        const pattern = patternList[i];
        const result = name.match(pattern);
        if (!result) {
            continue;
        }
        return { preset: result[1], rule: result[2] };
    }
    // Other case is a single rule
    // @org/rule or rule
    return {
        preset: null,
        rule: name
    };
};
/**
 * normalize `keyPath` that is specific path for rule
 * This normalize function handle ambiguity `key`
 * `keyPath` is one of "preset/rule` key, or "rule" key
 * @param keyPath
 */
export const normalizeKeyPath = (keyPath: string) => {
    const { preset, rule } = splitKeyToPresetSubRule(keyPath);
    if (!preset) {
        return normalizeRuleKey(rule);
    }
    return `${normalizeRulePresetKey(preset)}/${normalizeRuleKey(rule)}`;
};
export const normalizeRuleKey = (name: string) => {
    return removePrefixFromPackageName(["textlint-rule-"], name);
};
export const normalizeRulePresetKey = (name: string) => {
    return removePrefixFromPackageName(["textlint-rule-preset-", "preset-"], name);
};
/**
 * Remove `prefix` from `text`.
 */
export const removePrefixFromPackageName = (prefixList: string[], packageName: string) => {
    for (let i = 0; i < prefixList.length; i++) {
        const prefix = prefixList[i];
        // @scope/name -> @scope/name
        // @scope/textlint-rule-name -> @scope/name
        if (packageName.charAt(0) === "@") {
            const [namespace, name] = packageName.split("/");
            if (name.startsWith(prefix)) {
                return `${namespace}/${name.slice(prefix.length)}`;
            }
        }
        // name -> name
        // textlint-rule-name -> name
        else if (packageName.startsWith(prefix)) {
            return packageName.slice(prefix.length);
        }
    }
    // No match
    return packageName;
};
/**
 * filter messages by ignore messages
 * @param {Object[]} messages
 * @returns {Object[]} filtered messages
 */
export default function filterMessages(messages: ReadonlyArray<LintReportedMessage | IgnoreReportedMessage> = []) {
    const lintingMessages = messages.filter(message => {
        return message.type === MessageType.lint;
    }) as LintReportedMessage[];
    const ignoreMessages = messages.filter(message => {
        return message.type === MessageType.ignore;
    }) as IgnoreReportedMessage[];
    // if match, reject the message
    return lintingMessages.filter(message => {
        return !ignoreMessages.some(ignoreMessage => {
            const isInIgnoringRange = isContainedRange(message.index, ignoreMessage.range);
            if (isInIgnoringRange && ignoreMessage.ignoringRuleId) {
                // "*" is wildcard that match any rule
                if (ignoreMessage.ignoringRuleId === "*") {
                    return true;
                }
                return message.ruleId === normalizeKeyPath(ignoreMessage.ignoringRuleId);
            }
            return isInIgnoringRange;
        });
    });
}
