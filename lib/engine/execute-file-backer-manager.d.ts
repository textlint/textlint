import { AbstractBacker } from "./execute-file-backers/abstruct-backer";
import { TextlintTypes } from "@textlint/kernel";
export declare class ExecuteFileBackerManager {
    _backers: AbstractBacker[];
    /**
     * create MessageProcessManager with backers
     * @param {AbstractBacker[]} backers
     */
    constructor(backers?: AbstractBacker[]);
    /**
     * @param {AbstractBacker} backer
     */
    add(backer: AbstractBacker): void;
    /**
     * @param {AbstractBacker} backer
     */
    remove(backer: AbstractBacker): void;
    /**
     * process `messages` with registered processes
     * @param {string[]} files
     * @returns {Promise.<TextlintResult[]>}
     */
    process(files: string[], executeFile: (filePath: string) => Promise<TextlintTypes.TextlintResult>): Promise<TextlintTypes.TextlintResult[]>;
    /**
     * create fake result object
     * @param {string} filePath
     * @returns {TextlintResult}
     * @private
     */
    _createFakeResult(filePath: string): Promise<TextlintTypes.TextlintResult>;
}
