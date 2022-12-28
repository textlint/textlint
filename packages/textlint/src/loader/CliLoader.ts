import { loadPackagesFromRawConfig } from "@textlint/config-loader";
import { CliOptions } from "../options";
import { TextlintKernelDescriptor } from "@textlint/kernel";

export const loadCliDescriptor = async (cliOptions: CliOptions) => {
    const result = await loadPackagesFromRawConfig({
        node_moduleDir: cliOptions.rulesBaseDirectory,
        rawConfig: {
            ...(cliOptions.rule
                ? {
                      rules: {
                          [cliOptions.rule]: true
                      }
                  }
                : {}),
            ...(cliOptions.preset
                ? {
                      rules: {
                          [cliOptions.preset]: true
                      }
                  }
                : {}),
            ...(cliOptions.plugin
                ? {
                      plugins: {
                          [cliOptions.plugin]: true
                      }
                  }
                : {})
        }
    });
    if (!result.ok) {
        throw new Error("Failed to load packages", {
            cause: result.error
        });
    }
    const { rules, plugins, filterRules } = result.config;
    return new TextlintKernelDescriptor({
        rules,
        plugins,
        filterRules
    });
};
