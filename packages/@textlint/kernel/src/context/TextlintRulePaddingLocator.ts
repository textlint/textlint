import { TextlintRuleErrorPaddingLocation, TextlintRulePaddingLocator } from "@textlint/types";

export const isTextlintRuleErrorPaddingLocation = (o: any): o is TextlintRuleErrorPaddingLocation => {
    return (
        typeof o === "object" &&
        o !== null &&
        "type" in o &&
        o.type === "TextlintRuleErrorPaddingLocation" &&
        (Array.isArray(o.range) || typeof o.loc === "object")
    );
};
export const createPaddingLocator = (): TextlintRulePaddingLocator => {
    return {
        at(index: number) {
            return {
                type: "TextlintRuleErrorPaddingLocation",
                isAbsolute: false,
                range: [index, index + 1]
            };
        },
        range(aRange) {
            return {
                type: "TextlintRuleErrorPaddingLocation",
                isAbsolute: false,
                range: aRange
            };
        },
        loc(location) {
            return {
                type: "TextlintRuleErrorPaddingLocation",
                isAbsolute: false,
                loc: location
            };
        }
    };
};
