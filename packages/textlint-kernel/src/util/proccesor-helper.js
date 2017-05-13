// LICENSE : MIT
"use strict";
import assert from "assert";
/**
 * find processor with `ext`
 * @param {Processor[]} processors
 * @param {string} ext
 * @returns {Processor}
 */
export function getProcessorMatchExtension(processors, ext) {
    const matchProcessors = processors.filter(processor => {
        // static availableExtensions() method
        assert(typeof processor.constructor.availableExtensions === "function",
            `Processor(${processor.constructor.name} should have availableExtensions()`);
        const extList = processor.constructor.availableExtensions();
        return extList.some(targetExt => targetExt === ext || ("." + targetExt) === ext);
    });
    if (matchProcessors.length) {
        return matchProcessors[0];
    }
    return null;
}
