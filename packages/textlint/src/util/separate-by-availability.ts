import path from "node:path";

/**
 * classify files by extname
 * unAvailableFilePath will be used for warning.
 * If The user can use glob pattern like `src/*.js` as arguments, It will be expanded by shell.
 * pathsToGlobPatterns not modified that pattern.
 * So, unAvailableFilePath should be ignored silently.
 * @param {string[]} files
 * @param {{extensions?: string[]}} [options]
 * @returns {{availableFiles: string[], unAvailableFiles: string[]}}
 */
export function separateByAvailability(
    files: string[],
    options: { extensions?: string[] } = {}
): { availableFiles: string[]; unAvailableFiles: string[] } {
    const extensions = options.extensions || [];
    const availableFiles: string[] = [];
    const unAvailableFiles: string[] = [];
    files.forEach((filePath) => {
        const extname = path.extname(filePath) || path.basename(filePath);
        if (extensions.indexOf(extname) === -1) {
            unAvailableFiles.push(filePath);
        } else {
            availableFiles.push(filePath);
        }
    });
    return {
        availableFiles,
        unAvailableFiles
    };
}
