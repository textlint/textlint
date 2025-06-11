// @org/preset/@org/rule
const patternOrgXOrg = /^(@.*?\/.*?)\/(@.*?\/.*?)$/;
// @org/preset/rule
const patternOrgXRule = /^(@.*?\/.*?)\/(.*?)$/;
// preset/@org/rule
const patternPresetXOrg = /^(.*?)\/(@.*?)$/;
// preset/rule
const patternPresetXRule = /^([^@].*?)\/(.*?)$/;

/**
 * pattern list of key path
 */
const patternList = [patternOrgXOrg, patternOrgXRule, patternPresetXOrg, patternPresetXRule];
/**
 * split "preset/rule" string to {preset, rule}
 */
export const splitKeyToPresetSubRule = (name: string): { preset: string | null; rule: string } => {
    for (const pattern of patternList) {
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
