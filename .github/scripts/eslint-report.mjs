import fs from "node:fs";
import path from "node:path";

const reportPath = process.argv[2] ?? "eslint-report.json";
const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
const cwd = process.cwd();
const summaryPath = process.env.GITHUB_STEP_SUMMARY;
const maxSummaryRows = 200;

const issues = report.flatMap((result) => {
    const filePath = path.relative(cwd, result.filePath).replaceAll(path.sep, "/");
    return result.messages.map((message) => ({
        filePath,
        line: message.line,
        column: message.column,
        severity: message.severity === 2 ? "error" : "warning",
        message: message.message,
        ruleId: message.ruleId ?? "",
        fixable: Boolean(message.fix),
        suggestions: message.suggestions?.length ?? 0
    }));
});

const escapeCommandData = (value) =>
    String(value).replaceAll("%", "%25").replaceAll("\r", "%0D").replaceAll("\n", "%0A");

const escapeCommandProperty = (value) => escapeCommandData(value).replaceAll(":", "%3A").replaceAll(",", "%2C");

const escapeMarkdown = (value) =>
    String(value)
        .replaceAll("\\", "\\\\")
        .replaceAll("|", "\\|")
        .replaceAll("\n", "<br>");

const hintFor = (issue) => {
    const hints = [];
    if (issue.ruleId) {
        hints.push(`rule: ${issue.ruleId}`);
    }
    if (issue.fixable) {
        hints.push("auto-fix available");
    }
    if (issue.suggestions > 0) {
        hints.push(`${issue.suggestions} suggestion${issue.suggestions === 1 ? "" : "s"}`);
    }
    return hints.join("; ");
};

for (const issue of issues) {
    const command = issue.severity;
    const location = [
        `file=${escapeCommandProperty(issue.filePath)}`,
        issue.line ? `line=${issue.line}` : undefined,
        issue.column ? `col=${issue.column}` : undefined,
        `title=${escapeCommandProperty(issue.ruleId ? `ESLint ${issue.ruleId}` : "ESLint")}`
    ]
        .filter(Boolean)
        .join(",");
    const hint = hintFor(issue);
    const body = hint ? `${issue.message} (${hint})` : issue.message;
    console.log(`::${command} ${location}::${escapeCommandData(body)}`);
}

if (summaryPath) {
    const errors = issues.filter((issue) => issue.severity === "error").length;
    const warnings = issues.length - errors;
    const summary = ["### ESLint report", ""];

    if (issues.length === 0) {
        summary.push("No ESLint issues found.");
    } else {
        summary.push(`Found ${errors} error${errors === 1 ? "" : "s"} and ${warnings} warning${warnings === 1 ? "" : "s"}.`);
        summary.push("");
        summary.push("| Severity | File | Line | Rule | Message | Hint |");
        summary.push("| --- | --- | ---: | --- | --- | --- |");

        for (const issue of issues.slice(0, maxSummaryRows)) {
            summary.push(
                `| ${issue.severity} | ${escapeMarkdown(issue.filePath)} | ${issue.line ?? ""} | ${escapeMarkdown(
                    issue.ruleId || "-"
                )} | ${escapeMarkdown(issue.message)} | ${escapeMarkdown(hintFor(issue) || "-")} |`
            );
        }

        if (issues.length > maxSummaryRows) {
            summary.push("");
            summary.push(`Showing the first ${maxSummaryRows} issues. Open the ESLint report artifact for the full JSON output.`);
        }
    }

    fs.appendFileSync(summaryPath, `${summary.join("\n")}\n`);
}
