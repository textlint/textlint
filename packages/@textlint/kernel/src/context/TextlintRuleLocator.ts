import { TextlintRuleErrorLocation, TextlintRuleLocator } from "@textlint/types";

export const isTextlintRuleErrorLocation = (o: any): o is TextlintRuleErrorLocation => {
    return typeof o === "object" && o !== null && "type" in o && o.type === "TextlintRuleErrorLocation";
};
export const createLocator = (): TextlintRuleLocator => {
    return {
        at(index: number) {
            return {
                type: "TextlintRuleErrorLocation",
                isAbsolute: false,
                range: [index, index + 1]
            };
        },
        range(aRange) {
            return {
                type: "TextlintRuleErrorLocation",
                isAbsolute: false,
                range: aRange
            };
        },
        loc(location) {
            return {
                type: "TextlintRuleErrorLocation",
                isAbsolute: false,
                loc: location
            };
        }
    };
};
