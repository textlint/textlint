import {
    TextlintRuleErrorPaddingLocation,
    TextlintRuleErrorPaddingLocationLoc,
    TextlintRuleErrorPaddingLocationRange,
    TextlintRulePaddingLocator
} from "@textlint/types";

export const isTextlintRuleErrorPaddingLocObject = (loc: any): loc is TextlintRuleErrorPaddingLocationLoc => {
    return (
        typeof loc === "object" &&
        typeof loc.start === "object" &&
        typeof loc.end === "object" &&
        typeof loc.start.line === "number" &&
        !Number.isNaN(loc.start.line) &&
        typeof loc.start.column === "number" &&
        !Number.isNaN(loc.start.column) &&
        typeof loc.end.line === "number" &&
        !Number.isNaN(loc.end.line) &&
        typeof loc.end.column === "number" &&
        !Number.isNaN(loc.end.column)
    );
};
export const isTextlintRuleErrorPaddingLocRange = (range: any): range is TextlintRuleErrorPaddingLocationRange => {
    return Array.isArray(range) && range.length === 2;
};
export const isTextlintRuleErrorPaddingLocation = (o: any): o is TextlintRuleErrorPaddingLocation => {
    return (
        typeof o === "object" &&
        o !== null &&
        "type" in o &&
        o.type === "TextlintRuleErrorPaddingLocation" &&
        (isTextlintRuleErrorPaddingLocRange(o.range) || isTextlintRuleErrorPaddingLocObject(o.loc))
    );
};
export const createPaddingLocator = (): TextlintRulePaddingLocator => {
    return {
        at(index: number) {
            if (Number.isNaN(index)) {
                throw new Error(`index must be number: ${index}`);
            }
            return {
                type: "TextlintRuleErrorPaddingLocation",
                isAbsolute: false,
                range: [index, index + 1]
            };
        },
        range(aRange) {
            if (!Array.isArray(aRange)) {
                throw new Error("range must be array");
            }
            if (aRange.length !== 2) {
                throw new Error(`range must be [start, end]: ${JSON.stringify(aRange)}`);
            }
            if (Number.isNaN(aRange[0]) || Number.isNaN(aRange[1])) {
                throw new Error(`range must not be NaN: ${JSON.stringify(aRange)}`);
            }
            if (aRange[0] === aRange[1]) {
                throw new Error(`range must not be same: ${JSON.stringify(aRange)}
                
Probably, you need to use at() method instead.`);
            }
            return {
                type: "TextlintRuleErrorPaddingLocation",
                isAbsolute: false,
                range: aRange
            };
        },
        loc(location) {
            if (!isTextlintRuleErrorPaddingLocObject(location)) {
                throw new Error(`loc must be TextlintRuleErrorPaddingLocation object: ${JSON.stringify(location)}`);
            }
            return {
                type: "TextlintRuleErrorPaddingLocation",
                isAbsolute: false,
                loc: location
            };
        }
    };
};
