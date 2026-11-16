import fs from "node:fs";
import path from "node:path";

type PackageJson = {
    version?: string;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
};

/**
 * Find the closest package.json from `cwd` toward the root directory and return its parsed content.
 * Return `undefined` if no package.json is found.
 * Throw an error if the found package.json cannot be parsed.
 */
export const readClosestPackageJson = (cwd: string): PackageJson | undefined => {
    let directory = path.resolve(cwd);
    while (true) {
        const filePath = path.join(directory, "package.json");
        let content: string | undefined;
        try {
            content = fs.readFileSync(filePath, "utf-8");
        } catch {
            // not found or not readable: go to the parent directory
        }
        if (content !== undefined) {
            return JSON.parse(content) as PackageJson;
        }
        const parentDirectory = path.dirname(directory);
        if (parentDirectory === directory) {
            return undefined;
        }
        directory = parentDirectory;
    }
};

/**
 * Return the version of textlint from its package.json
 */
export const getTextlintVersion = (): string => {
    return readClosestPackageJson(__dirname)?.version ?? "unknown";
};
