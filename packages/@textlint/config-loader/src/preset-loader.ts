// LICENSE : MIT
import { moduleInterop } from "@textlint/module-interop";
import { TextLintModuleResolver } from "./textlint-module-resolver";
import { normalizeTextlintPresetSubRuleKey } from "@textlint/utils";
import { TextlintConfigDescriptor } from "./TextlintConfigDescriptor";
import { TextlintRcConfig } from "./TextlintRcConfig";
import { isPresetCreator } from "./is";
import { dynamicImport } from "./import";

export async function loadPreset({
    presetName,
    presetRulesOptions,
    moduleResolver
}: {
    presetName: string;
    presetRulesOptions: NonNullable<TextlintRcConfig["rules"]>;
    moduleResolver: TextLintModuleResolver;
}): Promise<TextlintConfigDescriptor["rules"]> {
    const presetPackageName = moduleResolver.resolvePresetPackageName(presetName);
    const mod = await dynamicImport(presetPackageName.filePath);
    const preset = moduleInterop(mod.default);
    if (!isPresetCreator(preset)) {
        throw new Error(`preset should have rules and rulesConfig: ${presetName}`);
    }
    // we should use preset.rules → some preset use different name actual rule
    return Object.keys(preset.rules).map((ruleId) => {
        const normalizedKey = normalizeTextlintPresetSubRuleKey({ preset: presetName, rule: ruleId });
        return {
            ruleId: normalizedKey,
            rule: preset.rules[ruleId],
            // prefer .textlintrc config than preset.rulesConfig
            options: presetRulesOptions[ruleId] ?? preset.rulesConfig[ruleId],
            filePath: presetPackageName.filePath,
            moduleName: presetPackageName.moduleName
        };
    });
}
