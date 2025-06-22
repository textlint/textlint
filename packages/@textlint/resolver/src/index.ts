import * as url from "node:url";
import path from "node:path";

export type ResolverContext = {
    parentModule: "config-loader" | "fixer-formatter" | "linter-formatter" | "textlint" | "textlint-legacy";
};
type ResolverSkipResult = undefined;
/**
 * Resolve Hook
 */
export type ResolveHook = (
    specifier: string,
    context: ResolverContext
) =>
    | {
          url: string | undefined;
      }
    | ResolverSkipResult;
/**
 * dynamic import() hook
 */
export type ImportHook = (
    specifier: string,
    context: ResolverContext
) => Promise<
    | {
          exports: Record<string, unknown>;
      }
    | ResolverSkipResult
>;

const resolveHooks: ResolveHook[] = [];
const importHooks: ImportHook[] = [];
/**
 * Register Resolver Hook
 * Hook can return resolved URL
 * if hooks pass through, it should return `undefined` instead of object
 * @param hook
 */
export const registerResolveHook = (hook: ResolveHook) => {
    resolveHooks.push(hook);
};

/**
 * Try to resolve package name
 * if `packageName` is found, return resolved absolute path.
 * if `packageName` is not found, return `undefined`
 * @param packageName
 * @param context
 */
export const tryResolve = (packageName: string, context: ResolverContext): string | undefined => {
    try {
        for (const hook of resolveHooks) {
            const result = hook(packageName, context);
            // Skip if hook return undefined from hook
            if (!result) {
                continue;
            }
            if (result?.url) {
                return result.url;
            }
        }

        // TODO: consider using import.meta.resolve(packageName) for future ESM support
        // import.meta.resolve is supported in Node.js 20.6.0+
        return require.resolve(packageName);
    } catch {
        return undefined;
    }
};

/**
 * Register Import Hook
 * @param hook
 */
export const registerImportHook = (hook: ImportHook) => {
    importHooks.push(hook);
};

// Windows's path require to convert file://
// https://github.com/secretlint/secretlint/issues/205
const convertToFileUrl = (filePath: string) => {
    if (filePath.startsWith("file://")) {
        return filePath;
    }
    return url.pathToFileURL(filePath).href;
};
/**
 * dynamic import() with hooks
 * @param specifier file path or package name
 * @param context
 */
export const dynamicImport = async (
    specifier: string,
    context: ResolverContext
): Promise<{
    exports: Record<string, unknown> | undefined;
}> => {
    for (const hook of importHooks) {
        const result = await hook(specifier, context);
        if (result) {
            return result;
        }
    }
    // if the `specifier` is not absolute path, it should be package name
    if (!path.isAbsolute(specifier)) {
        return {
            exports: await import(specifier),
        };
    }
    return {
        exports: await import(convertToFileUrl(specifier)),
    };
};

/**
 * Clear all hooks
 */
export const clearHooks = () => {
    resolveHooks.length = 0;
    importHooks.length = 0;
};
