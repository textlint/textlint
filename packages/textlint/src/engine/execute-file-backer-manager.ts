import { AbstractBacker } from "./execute-file-backers/abstruct-backer.js";
import { TextlintResult } from "@textlint/kernel";

/**
 * The number of files in process at the same time.
 * Linting uses one thread, so more files at the same time do not finish earlier;
 * they only keep more file contents and syntax trees in memory.
 * It is more than one, so a rule that waits for I/O, such as a network request, waits for some files at the same time.
 */
const MAX_CONCURRENT_FILES = 8;

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
     *
     * At most MAX_CONCURRENT_FILES files are in process at the same time, in the order of `files`.
     * The results have the executed files in the order of `files`, and then the un-executed files.
     */
    async process<R extends TextlintResult>(
        files: string[],
        executeFile: (filePath: string) => Promise<R>
    ): Promise<R[]> {
        const executeFiles: string[] = [];
        const unExecutedResults: R[] = [];
        for (const filePath of files) {
            const shouldExecute = this._backers.every((backer) => {
                return backer.shouldExecute({ filePath });
            });
            if (shouldExecute) {
                executeFiles.push(filePath);
            } else {
                // add fake unExecutedResults for un-executed file.
                unExecutedResults.push({
                    filePath,
                    messages: []
                } as TextlintResult as R);
            }
        }
        const results = new Array<R>(executeFiles.length);
        let nextIndex = 0;
        let failed = false;
        const executeNextFiles = async () => {
            while (!failed && nextIndex < executeFiles.length) {
                const index = nextIndex++;
                try {
                    const result = await executeFile(executeFiles[index]);
                    this._backers.forEach((backer) => {
                        backer.didExecute({ result });
                    });
                    results[index] = result;
                } catch (error) {
                    // do not start the next files when a file fails
                    failed = true;
                    throw error;
                }
            }
        };
        await Promise.all(
            Array.from({ length: Math.min(MAX_CONCURRENT_FILES, executeFiles.length) }, executeNextFiles)
        );
        // wait all resolved, and call afterAll
        this._backers.forEach((backer) => {
            backer.afterAll();
        });
        return results.concat(unExecutedResults);
    }
}
