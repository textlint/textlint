#!/usr/bin/env node

// このスクリプトは、presetとseverityの組み合わせの問題を調査するためのものです

// 現在のコードベースから重要な部分を取得してテストします
console.log("=== Preset and Severity Investigation ===");

// loader.tsの loadPreset 関数の重要な部分をチェック
console.log("\n1. loadPreset関数でのオプション処理:");
console.log("   // prefer .textlintrc config than preset.rulesConfig");
console.log("   options: presetRulesOptions[ruleKey] ?? preset.rulesConfig[ruleKey]");

// getSeverity関数の動作をチェック
console.log("\n2. getSeverity関数の動作:");

// 簡単なgetSeverity関数の模擬
const TextlintRuleSeverityLevelKeys = {
    none: 0,
    info: 0,
    warning: 1,
    error: 2
};

function getSeverity(ruleConfig) {
    if (ruleConfig === undefined) {
        return TextlintRuleSeverityLevelKeys.error;
    }
    // rule:<true|false>
    if (typeof ruleConfig === "boolean") {
        return ruleConfig ? TextlintRuleSeverityLevelKeys.error : TextlintRuleSeverityLevelKeys.none;
    }
    if (ruleConfig.severity) {
        const severityValue = TextlintRuleSeverityLevelKeys[ruleConfig.severity];
        return severityValue;
    }
    return TextlintRuleSeverityLevelKeys.error;
}

console.log("\n3. テストケース:");

// テストケース1: preset内のルールがtrueの場合
const presetRuleConfig = true;
const userConfig = undefined;
const finalOptions = userConfig ?? presetRuleConfig;
console.log(`   Preset config: ${presetRuleConfig}, User config: ${userConfig}`);
console.log(`   Final options: ${finalOptions}`);
console.log(`   Severity: ${getSeverity(finalOptions)} (${getSeverityName(getSeverity(finalOptions))})`);

// テストケース2: preset内のルールがseverity付きオブジェクトの場合
const presetRuleConfigWithSeverity = { severity: "warning" };
const userConfigUndefined = undefined;
const finalOptions2 = userConfigUndefined ?? presetRuleConfigWithSeverity;
console.log(`\n   Preset config: ${JSON.stringify(presetRuleConfigWithSeverity)}, User config: ${userConfigUndefined}`);
console.log(`   Final options: ${JSON.stringify(finalOptions2)}`);
console.log(`   Severity: ${getSeverity(finalOptions2)} (${getSeverityName(getSeverity(finalOptions2))})`);

// テストケース3: ユーザーがseverityを上書きする場合
const presetRuleConfig3 = { severity: "warning" };
const userConfigOverride = { severity: "error" };
const finalOptions3 = userConfigOverride ?? presetRuleConfig3;
console.log(
    `\n   Preset config: ${JSON.stringify(presetRuleConfig3)}, User config: ${JSON.stringify(userConfigOverride)}`
);
console.log(`   Final options: ${JSON.stringify(finalOptions3)}`);
console.log(`   Severity: ${getSeverity(finalOptions3)} (${getSeverityName(getSeverity(finalOptions3))})`);

// テストケース4: ユーザーが他のオプションを設定するがseverityは設定しない場合
const presetRuleConfig4 = { severity: "warning", someOption: true };
const userConfigPartial = { anotherOption: false };
const finalOptions4 = userConfigPartial ?? presetRuleConfig4;
console.log(
    `\n   Preset config: ${JSON.stringify(presetRuleConfig4)}, User config: ${JSON.stringify(userConfigPartial)}`
);
console.log(`   Final options: ${JSON.stringify(finalOptions4)}`);
console.log(`   Severity: ${getSeverity(finalOptions4)} (${getSeverityName(getSeverity(finalOptions4))})`);

function getSeverityName(level) {
    switch (level) {
        case 0:
            return "none/info";
        case 1:
            return "warning";
        case 2:
            return "error";
        default:
            return "unknown";
    }
}

console.log("\n4. 問題の分析:");
console.log("   上記のテストケース4で問題が発生している可能性があります。");
console.log("   ユーザーがpreset内のルールに一部のオプションを設定すると、");
console.log("   preset内で定義されたseverityが失われてしまいます。");
console.log("   これは ?? 演算子がuserConfigがundefinedの場合のみ");
console.log("   presetRuleConfig を使用するためです。");

console.log("\n5. 正しい動作のためには:");
console.log("   オブジェクトのマージが必要です。例:");
console.log("   options: { ...preset.rulesConfig[ruleKey], ...presetRulesOptions[ruleKey] }");
