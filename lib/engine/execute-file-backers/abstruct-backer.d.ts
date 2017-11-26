import { TextlintTypes } from "@textlint/kernel";
export declare abstract class AbstractBacker {
    /**
     * @param {string} filePath
     * @returns {boolean}
     */
    abstract shouldExecute({filePath}: {
        filePath: string;
    }): boolean;
    /**
     * @param {TextlintResult} result
     * @returns {boolean}
     */
    abstract didExecute({result}: {
        result: TextlintTypes.TextlintResult;
    }): void;
    /**
     * call when after all execution is completed
     */
    abstract afterAll(): void;
}
