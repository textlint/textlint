import { AbstractBacker } from "./execute-file-backers/abstruct-backer";
import { TextlintResult } from "@textlint/kernel";

export class ExecuteFileBackerManager {
    private _backers: AbstractBacker[];

    /**
     * create MessageProcessManager with backers
     * @param {AbstractBacker[]} backers
     */
    constructor(backers: AbstractBacker[] = []) {
        this._backers = backers;
    }

    /**
     * @param {AbstractBacker} backer
     */
    add(backer: AbstractBacker) {
        this._backers.push(backer);
    }

    /**
     * @param {AbstractBacker} backer
     */
    remove(backer: AbstractBacker) {
        const index = this._backers.indexOf(backer);
        if (index !== -1) {
            this._backers.splice(index, 1);
        }
    }

    /**
     * process `messages` with registered processes
     */
    process<R extends TextlintResult>(files: string[], executeFile: (filePath: string) => Promise<R>): Promise<R[]> {
        const unExecutedResults: Array<Promise<R>> = [];
        const resultPromises = files
            .filter((filePath) => {
                const shouldExecute = this._backers.every((backer) => {
                    return backer.shouldExecute({ filePath });
                });
                // add fake unExecutedResults for un-executed file.
                if (!shouldExecute) {
                    const value = {
                        filePath,
                        messages: []
                    } as TextlintResult as R;
                    unExecutedResults.push(Promise.resolve(value));
                }
                return shouldExecute;
            })
            .map((filePath) => {
                return executeFile(filePath).then((result) => {
                    this._backers.forEach((backer) => {
                        backer.didExecute({ result });
                    });
                    return result;
                });
            })
            .concat(unExecutedResults);
        // wait all resolved, and call afterAll
        return Promise.all(resultPromises).then((results: R[]) => {
            this._backers.forEach((backer) => {
                backer.afterAll();
            });
            return results;
        });
    }
}
