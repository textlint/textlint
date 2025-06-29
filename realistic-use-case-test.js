#!/usr/bin/env node

// 実際のユースケースでの修正効果を確認します
console.log("=== 現実的なユースケースでの検証 ===");

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

console.log("\n実際のユースケース:");

// ケース1: プリセットで警告レベルに設定されたルールに、ユーザーが追加オプションを設定
console.log("\n1. プリセット: Japanese writing rules (warning level)");
console.log("   ユーザー: カスタムオプションを追加");
const presetJapanese = { severity: "warning", allowHalfWidthSpace: false };
const userJapanese = { customDictionary: ["専門用語"] };
const finalJapanese = getOptionsAfterFix(presetJapanese, userJapanese);
console.log(`   結果: ${JSON.stringify(finalJapanese)}`);
console.log(`   Severity: ${getSeverityName(getSeverity(finalJapanese))} (preserved from preset)`);

// ケース2: プリセットで設定されたno-todoルール
console.log("\n2. プリセット: no-todo rule (warning level)");
console.log("   ユーザー: 許可キーワードリストを追加");
const presetNoTodo = { severity: "warning", keywords: ["TODO", "FIXME"] };
const userNoTodo = { allow: ["TODO: comment for reviewers"] };
const finalNoTodo = getOptionsAfterFix(presetNoTodo, userNoTodo);
console.log(`   結果: ${JSON.stringify(finalNoTodo)}`);
console.log(`   Severity: ${getSeverityName(getSeverity(finalNoTodo))} (preserved from preset)`);

// ケース3: ユーザーがseverityを明示的に上書きする場合
console.log("\n3. プリセット: max-ten rule (warning level)");
console.log("   ユーザー: error レベルに変更");
const presetMaxTen = { severity: "warning", max: 3 };
const userMaxTen = { severity: "error", max: 5 };
const finalMaxTen = getOptionsAfterFix(presetMaxTen, userMaxTen);
console.log(`   結果: ${JSON.stringify(finalMaxTen)}`);
console.log(`   Severity: ${getSeverityName(getSeverity(finalMaxTen))} (overridden by user)`);

console.log("\n修正の意義:");
console.log("🔧 プリセット作者がルールのseverityを適切に設定できる");
console.log("🔧 ユーザーがルールの一部オプションをカスタマイズしても、");
console.log("   プリセットの severity 設定が保持される");
console.log("🔧 ユーザーが明示的に severity を設定した場合は、それが優先される");
console.log("🔧 boolean設定の場合は従来通りの動作を維持");
