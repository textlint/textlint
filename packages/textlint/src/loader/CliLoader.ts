import { loadPackagesFromRawConfig } from "@textlint/config-loader";
import { CliOptions } from "../options";
import { TextlintKernelDescriptor, TextlintKernelRule } from "@textlint/kernel";
import { normalizeTextlintPluginKey, normalizeTextlintRuleKey } from "@textlint/utils";
import debug_ from "debug";
import { loadFromDirAsESM } from "../engine/rule-loader";

const debug = debug_("textlint:cli-loader");
export const loadCliDescriptor = async (cliOptions: CliOptions) => {
    const rawRules = Object.create(null);
    const rawPlugins = Object.create(null);
    // --rule
    cliOptions.rule?.forEach((rule) => {
        rawRules[normalizeTextlintRuleKey(rule)] = true;
    });
    // --preset
    cliOptions.preset?.forEach((preset) => {
        //:support --preset=jtf-style
        if (preset.includes("preset-")) {
            rawRules[preset] = true;
        } else {
            rawRules[`preset-${preset}`] = true;
        }
    });
    // --plugin
    cliOptions.plugin?.forEach((plugin) => {
        rawPlugins[normalizeTextlintPluginKey(plugin)] = true;
    });
    const result = await loadPackagesFromRawConfig({
        node_moduleDir: cliOptions.rulesBaseDirectory,
        rawConfig: {
            ...(Object.keys(rawRules).length > 0 ? { rules: rawRules } : {}),
            ...(Object.keys(rawPlugins).length > 0 ? { plugins: rawPlugins } : {})
        }
    });
    if (!result.ok) {
        debug("loadPackagesFromRawConfig failed: %o", result);
        throw new Error("Failed to load packages", {
            cause: result.error
        });
    }
    // --rulesdir
    const rulesDirRules: TextlintKernelRule[] = (
        await Promise.all(
            cliOptions.rulesdir?.map((rulesdir) => {
                debug("Loading rules from %o", rulesdir);
                return loadFromDirAsESM(rulesdir);
            }) ?? []
        )
    ).flat();
    const { rules, plugins, filterRules } = result.config;
    return new TextlintKernelDescriptor({
        rules: [...rules, ...rulesDirRules],
        plugins,
        filterRules
    });
};
