// MIT © 2016 azu
"use strict";
/* eslint-disable */
import type { TextlintResult } from "@textlint/kernel";

export abstract class AbstractBacker {
    /**
     * @param {string} filePath
     * @returns {boolean}
     */
    abstract shouldExecute({ filePath }: { filePath: string }): boolean;

    /**
     * @returns {boolean}
     */
    abstract didExecute<R extends TextlintResult>({ result }: { result: R }): void;

    /**
     * call when after all execution is completed
     */
    abstract afterAll(): void;
}
