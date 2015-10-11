// LICENSE : MIT
"use strict";
import assert from "assert";
export function getProcessorMatchExtension(processors, ext) {
    let matchProcessors = processors.filter(processor => {
        assert(typeof processor.availableExtensions === "function", `Processor(${processor.constructor.name} should have availableExtensions()`);
        var extList = processor.availableExtensions();
        return extList.some(targetExt => targetExt === ext || ("." + targetExt) === ext);
    });
    if (matchProcessors.length) {
        return matchProcessors[0];
    }
    return null;
}
