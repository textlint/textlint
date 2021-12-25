import { TextlintRuleLocator, TextlintSourceCode } from "@textlint/types";

export const createLocator = (sourceCode: TextlintSourceCode): TextlintRuleLocator => {
    return {
        at(index: number) {
            return {
                isAbsolute: false,
                range: [index, index + 1]
            };
        },
        range(aRange) {
            return {
                isAbsolute: false,
                range: aRange
            };
        },
        loc(location) {
            return {
                isAbsolute: false,
                range: sourceCode.locationToRange(location)
            };
        }
    };
};
