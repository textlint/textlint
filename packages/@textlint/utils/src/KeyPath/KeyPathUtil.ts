// A key path is split without regular expressions.
// Nested lazy quantifiers such as /^(@.*?\/.*?)\/(@.*?\/.*?)$/ take polynomial time on some inputs.
// Each pattern below keeps the result of the regular expression it replaces, including that `.` does not match a line terminator.
const LINE_TERMINATOR = /[\n\r\u2028\u2029]/;
type PresetSubRule = { preset: string; rule: string };
const splitAt = (name: string, index: number): PresetSubRule => {
    return { preset: name.slice(0, index), rule: name.slice(index + 1) };
};
/**
 * @org/preset/@org/rule
 * /^(@.*?\/.*?)\/(@.*?\/.*?)$/
 */
const matchOrgXOrg = (name: string): PresetSubRule | null => {
    if (name.charAt(0) !== "@") {
        return null;
    }
    const orgSlash = name.indexOf("/", 1);
    if (orgSlash === -1) {
        return null;
    }
    const separator = name.indexOf("/@", orgSlash + 1);
    // the rule part needs a "/" after "@"
    if (separator === -1 || name.lastIndexOf("/") < separator + 2) {
        return null;
    }
    return splitAt(name, separator);
};
/**
 * @org/preset/rule
 * /^(@.*?\/.*?)\/(.*?)$/
 */
const matchOrgXRule = (name: string): PresetSubRule | null => {
    if (name.charAt(0) !== "@") {
        return null;
    }
    const orgSlash = name.indexOf("/", 1);
    if (orgSlash === -1) {
        return null;
    }
    const separator = name.indexOf("/", orgSlash + 1);
    if (separator === -1) {
        return null;
    }
    return splitAt(name, separator);
};
/**
 * preset/@org/rule
 * /^(.*?)\/(@.*?)$/
 */
const matchPresetXOrg = (name: string): PresetSubRule | null => {
    const separator = name.indexOf("/@");
    if (separator === -1) {
        return null;
    }
    return splitAt(name, separator);
};
/**
 * preset/rule
 * /^([^@].*?)\/(.*?)$/
 */
const matchPresetXRule = (name: string): PresetSubRule | null => {
    if (name.length === 0 || name.charAt(0) === "@") {
        return null;
    }
    const separator = name.indexOf("/", 1);
    if (separator === -1) {
        return null;
    }
    return splitAt(name, separator);
};
/**
 * split "preset/rule" string to {preset, rule}
 */
export const splitKeyToPresetSubRule = (name: string): { preset: string | null; rule: string } => {
    // `.` in the patterns does not match a line terminator.
    // Only the first character of "preset/rule" can be a line terminator, because it is matched by [^@]
    if (!LINE_TERMINATOR.test(name.slice(1))) {
        const result = LINE_TERMINATOR.test(name.charAt(0))
            ? matchPresetXRule(name)
            : matchOrgXOrg(name) ?? matchOrgXRule(name) ?? matchPresetXOrg(name) ?? matchPresetXRule(name);
        if (result) {
            return result;
        }
    }
    // Other case is a single rule
    // @org/rule or rule
    return {
        preset: null,
        rule: name,
    };
};

/**
 * Remove `prefix` from `text`.
 */
export const removePrefixFromPackageName = (prefixList: string[], packageName: string) => {
    for (const prefix of prefixList) {
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
