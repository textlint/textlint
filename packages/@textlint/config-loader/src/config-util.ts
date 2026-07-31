export function isPluginRuleKey(key: string) {
    // @<owner>/<plugin><>rule>
    if (key.startsWith("@") && key.indexOf("/textlint-plugin") !== -1) {
        return true;
    }
    // not contain @, but contain /
    // <plugin>/<rule>
    return !key.startsWith("@") && key.indexOf("/") !== -1;
}

export function isPresetRuleKey(key: string) {
    // "preset-name" is special pattern
    if (key.startsWith("preset-")) {
        return true;
    }
    if (key.startsWith("textlint-rule-preset-")) {
        return true;
    }
    // scoped module: @textlint/textlint-rule-preset-foo
    if (key.startsWith("@")) {
        if (key.indexOf("/preset-") !== -1 || key.indexOf("/textlint-rule-preset-") !== -1) {
            return true;
        }
    }
    return false;
}
