import fs from "node:fs";
import path from "node:path";

type PackageJson = {
    version?: string;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    optionalDependencies?: Record<string, string>;
};

const isFile = (filePath: string): boolean => {
    try {
        return fs.statSync(filePath).isFile();
    } catch {
        return false;
    }
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
        if (isFile(filePath)) {
            // Throw if the closest package.json cannot be read or parsed
            return JSON.parse(fs.readFileSync(filePath, "utf-8")) as PackageJson;
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
