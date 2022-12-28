import { loadConfig } from "@textlint/config-loader";
import { TextlintKernelDescriptor } from "@textlint/kernel";
import path from "node:path";

export const loadTextlintrc = async () => {
    const result = await loadConfig({
        preLoadingPackage: (packageOptions) => {
            // Add text and markdown by default
            // if user defined text or markdown, it is preferred than default
            packageOptions.rawConfig.plugins = Array.isArray(packageOptions.rawConfig?.plugins)
                ? ["@textlint/text", "@textlint/markdown"].concat(packageOptions.rawConfig?.plugins ?? [])
                : {
                      "@textlint/text": true,
                      "@textlint/markdown": true,
                      ...packageOptions.rawConfig?.plugins
                  };
            return packageOptions;
        }
    });
    if (!result.ok) {
        throw new Error("Failed to load textlintrc", {
            cause: result.error
        });
    }
    const { rules, plugins, filterRules } = result.config;
    return new TextlintKernelDescriptor({
        rules,
        plugins,
        filterRules,
        configBaseDir: path.dirname(result.configFilePath)
    });
};
