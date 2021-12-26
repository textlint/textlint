import { TextlintRuleLocator } from "@textlint/types";

export const createLocator = (): TextlintRuleLocator => {
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
                loc: location
            };
        }
    };
};
