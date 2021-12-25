import { TextlintRuleErrorLocation } from "./TextlintRuleError";

export type TextlintRuleLocator = {
    /**
     * @param index relative index from node's start position
     */
    at(index: number): TextlintRuleErrorLocation;
    /**
     * @param range relative range from node's start position
     */
    range(range: [startIndex: number, endIndex: number]): TextlintRuleErrorLocation;
    /**
     * @param location relative location from node's start position
     */
    loc(location: {
        start: {
            line: number;
            column: number;
        };
        end: {
            line: number;
            column: number;
        };
    }): TextlintRuleErrorLocation;
};
