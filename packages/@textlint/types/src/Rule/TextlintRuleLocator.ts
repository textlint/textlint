import { TextlintRuleErrorLocation } from "./TextlintRuleError";

export type TextlintRuleLocator = {
    /**
     * at's index is 0-based value.
     * It is alias to `range([index, index + 1])`
     * @param index relative index from node's start position
     */
    at(index: number): TextlintRuleErrorLocation;
    /**
     * range's index is 0-based value
     * @param range relative range from node's start position
     */
    range(range: readonly [startIndex: number, endIndex: number]): TextlintRuleErrorLocation;
    /**
     * line is relative padding value from node's start position
     * column is relative padding value from node's start position
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
