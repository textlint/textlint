export {
    loadConfig,
    loadRawConfig,
    loadPackagesFromRawConfig,
    TextlintConfigLoaderOptions,
    TextlintConfigLoaderRawResult,
    TextlintLintConfigLoaderResult,
    TextlintLoadPackagesFromRawConfigOptions,
    TextlintLoadPackagesFromRawConfigResult
} from "./config-loader.js";
export { TextlintRcConfig } from "./TextlintRcConfig.js";
export {
    TextlintConfigDescriptor,
    TextlintConfigFilterRule,
    TextlintConfigPlugin,
    TextlintConfigRule,
    TextlintConfigRulePreset
} from "./TextlintConfigDescriptor.js";

export { isTextlintRulePresetCreator, isTextlintRuleModule, isTextlintFilterRuleModule } from "./is.js";
