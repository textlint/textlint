import { loadConfig } from "@textlint/config-loader";
import { TextlintKernelDescriptor, TextlintKernelPlugin } from "@textlint/kernel";
import path from "node:path";
import textPlugin from "@textlint/textlint-plugin-text";
import markdownPlugin from "@textlint/textlint-plugin-markdown";

export type LoadTextlintrcOptions = {
    configFilePath?: string;
    rulesBaseDirectory?: string;
};
export const loadTextlintrc = async ({ configFilePath, rulesBaseDirectory }: LoadTextlintrcOptions) => {
    const result = await loadConfig({
        configFilePath: configFilePath,
        node_moduleDir: rulesBaseDirectory,
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
        const defaultPlugins: TextlintKernelPlugin[] = [
            {
                pluginId: "@textlint/text",
                plugin: textPlugin,
                options: true
            },
            {
                pluginId: "@textlint/markdown",
                plugin: markdownPlugin,
                options: true
            }
        ];
        return new TextlintKernelDescriptor({
            rules: [],
            filterRules: [],
            plugins: defaultPlugins
        });
        // throw new Error("Failed to load textlintrc", {
        //     cause: result.error
        // });
    }
    const { rules, plugins, filterRules } = result.config;
    return new TextlintKernelDescriptor({
        rules,
        plugins,
        filterRules,
        configBaseDir: path.dirname(result.configFilePath)
    });
};
