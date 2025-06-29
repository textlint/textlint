#!/usr/bin/env node

// 修正後のロジックをテストします
console.log("=== 修正後のPreset と Severity Investigation ===");

// 修正後のロジック
function getOptionsAfterFix(presetRuleConfig, userConfig) {
    if (userConfig !== undefined) {
        if (typeof userConfig === "boolean" || typeof presetRuleConfig === "boolean") {
            return userConfig;
        } else {
            return { ...presetRuleConfig, ...userConfig };
        }
    } else {
        return presetRuleConfig;
    }
}

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
    if (typeof ruleConfig === "boolean") {
        return ruleConfig ? TextlintRuleSeverityLevelKeys.error : TextlintRuleSeverityLevelKeys.none;
    }
    if (ruleConfig.severity) {
        const severityValue = TextlintRuleSeverityLevelKeys[ruleConfig.severity];
        return severityValue;
    }
    return TextlintRuleSeverityLevelKeys.error;
}

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

console.log("\n修正後のテストケース:");

// テストケース1: preset内のルールがtrueの場合
const presetRuleConfig1 = true;
const userConfig1 = undefined;
const finalOptions1 = getOptionsAfterFix(presetRuleConfig1, userConfig1);
console.log(`1. Preset: ${presetRuleConfig1}, User: ${userConfig1}`);
console.log(`   結果: ${finalOptions1}, Severity: ${getSeverityName(getSeverity(finalOptions1))}`);

// テストケース2: preset内のルールがseverity付きオブジェクトの場合
const presetRuleConfig2 = { severity: "warning" };
const userConfig2 = undefined;
const finalOptions2 = getOptionsAfterFix(presetRuleConfig2, userConfig2);
console.log(`\n2. Preset: ${JSON.stringify(presetRuleConfig2)}, User: ${userConfig2}`);
console.log(`   結果: ${JSON.stringify(finalOptions2)}, Severity: ${getSeverityName(getSeverity(finalOptions2))}`);

// テストケース3: ユーザーがseverityを上書きする場合
const presetRuleConfig3 = { severity: "warning" };
const userConfig3 = { severity: "error" };
const finalOptions3 = getOptionsAfterFix(presetRuleConfig3, userConfig3);
console.log(`\n3. Preset: ${JSON.stringify(presetRuleConfig3)}, User: ${JSON.stringify(userConfig3)}`);
console.log(`   結果: ${JSON.stringify(finalOptions3)}, Severity: ${getSeverityName(getSeverity(finalOptions3))}`);

// テストケース4: ユーザーが他のオプションを設定するがseverityは設定しない場合（修正前は問題があったケース）
const presetRuleConfig4 = { severity: "warning", someOption: true };
const userConfig4 = { anotherOption: false };
const finalOptions4 = getOptionsAfterFix(presetRuleConfig4, userConfig4);
console.log(`\n4. Preset: ${JSON.stringify(presetRuleConfig4)}, User: ${JSON.stringify(userConfig4)}`);
console.log(`   結果: ${JSON.stringify(finalOptions4)}, Severity: ${getSeverityName(getSeverity(finalOptions4))}`);

// テストケース5: ユーザーがbooleanで設定する場合
const presetRuleConfig5 = { severity: "warning", someOption: true };
const userConfig5 = false;
const finalOptions5 = getOptionsAfterFix(presetRuleConfig5, userConfig5);
console.log(`\n5. Preset: ${JSON.stringify(presetRuleConfig5)}, User: ${userConfig5}`);
console.log(`   結果: ${finalOptions5}, Severity: ${getSeverityName(getSeverity(finalOptions5))}`);

console.log("\n修正の効果:");
console.log("✅ テストケース4で、preset の severity: 'warning' が保持されている");
console.log("✅ ユーザーの設定 (anotherOption: false) も適用されている");
console.log("✅ severity と他のオプションが正しくマージされている");
