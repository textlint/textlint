// LICENSE : MIT
"use strict";
import * as assert from "assert";
import {
    TextlintKernelProcessor,
    TextlintKernelProcessorConstructor
} from "../textlint-kernel-interface";

/**
 * find processor with `ext`
 * @param {Processor[]} processors
 * @param {string} ext
 * @returns {Processor}
 */
export function getProcessorMatchExtension(processors: TextlintKernelProcessor[], ext: string) {
    const matchProcessors = processors.filter(processor => {
        // static availableExtensions() method
        const processorConstructor: TextlintKernelProcessorConstructor = processor.constructor as any;
        assert(
            typeof processorConstructor.availableExtensions === "function",
            `Processor(${processorConstructor.name} should have availableExtensions()`
        );
        const extList = processorConstructor.availableExtensions();
        return extList.some(targetExt => targetExt === ext || "." + targetExt === ext);
    });
    if (matchProcessors.length) {
        return matchProcessors[0];
    }
    return null;
}
