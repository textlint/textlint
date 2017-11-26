import { TextLintFixCommand } from "../textlint-kernel-interface";
export interface RuleErrorPadding {
    line?: number;
    column?: number;
    index?: number;
    fix?: TextLintFixCommand;
}
export default class RuleError {
    message: string;
    private line?;
    private column?;
    private index?;
    private fix?;
    /**
     * RuleError is like Error object.
     * It's used for adding to TextlintResult.
     * @param {string} message error message should start with lowercase letter
     * @param {RuleError~Padding|number} [paddingLocation] - the object has padding {line, column} for actual error reason
     * @constructor
     */
    constructor(message: string, paddingLocation?: number | RuleErrorPadding);
    toString(): string;
}
