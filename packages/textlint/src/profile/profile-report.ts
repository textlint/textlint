// LICENSE : MIT
import path from "node:path";
import type { TextlintProfileEntry } from "@textlint/kernel";

export type TextlintProfilePhase = {
    name: string;
    depth: number;
    time: number;
    percent: number;
    count: number;
};
export type TextlintProfileParser = {
    id: string;
    time: number;
    count: number;
};
export type TextlintProfileRule = {
    id: string;
    type: "rule" | "filter-rule";
    time: number;
    percent: number;
    count: number;
};
export type TextlintProfileFile = {
    filePath: string;
    time: number;
};
/**
 * The summary of `textlint --profile`.
 * Times are in milliseconds.
 */
export type TextlintProfileReport = {
    total: number;
    files: number;
    phases: TextlintProfilePhase[];
    parsers: TextlintProfileParser[];
    rules: TextlintProfileRule[];
    slowestFiles: TextlintProfileFile[];
};

/**
 * Phases in the order of a run.
 * A phase with depth 1 runs in the lint (or fix) phase.
 */
const PHASES: ReadonlyArray<{ name: string; depth: number; types: string[] }> = [
    { name: "startup", depth: 0, types: ["startup"] },
    { name: "load-config", depth: 0, types: ["load-config"] },
    { name: "search-files", depth: 0, types: ["search-files"] },
    { name: "lint", depth: 0, types: ["lint"] },
    { name: "fix", depth: 0, types: ["fix"] },
    { name: "parse", depth: 1, types: ["parse"] },
    { name: "traverse", depth: 1, types: ["traverse"] },
    { name: "rules", depth: 1, types: ["rule"] },
    { name: "filter-rules", depth: 1, types: ["filter-rule"] },
    { name: "post-process", depth: 1, types: ["post-process"] },
    { name: "apply-fixes", depth: 1, types: ["apply-fixes"] },
    { name: "format", depth: 0, types: ["format"] },
    { name: "write-files", depth: 0, types: ["write-files"] }
];
const MAX_FILES = 10;
const MAX_MARKDOWN_RULES = 10;

const percentOf = (time: number, total: number) => (total > 0 ? (time * 100) / total : 0);

/**
 * Create the summary from the totals of the profiler
 * @param entries the totals of the profiler
 * @param options.total the total time of the run
 * @param options.files the number of the linted files
 */
export const createProfileReport = (
    entries: TextlintProfileEntry[],
    options: { total: number; files: number }
): TextlintProfileReport => {
    const { total, files } = options;
    const phases: TextlintProfilePhase[] = [];
    for (const phase of PHASES) {
        const matched = entries.filter((entry) => phase.types.includes(entry.type));
        if (matched.length === 0) {
            continue;
        }
        const time = matched.reduce((sum, entry) => sum + entry.total, 0);
        const count = matched.reduce((sum, entry) => sum + entry.count, 0);
        phases.push({ name: phase.name, depth: phase.depth, time, percent: percentOf(time, total), count });
    }
    const parsers = entries
        .filter((entry) => entry.type === "parse")
        .map((entry) => ({ id: entry.id ?? "(unknown)", time: entry.total, count: entry.count }))
        .sort((a, b) => b.time - a.time);
    const rules = entries
        .filter((entry) => entry.type === "rule" || entry.type === "filter-rule")
        .map((entry) => ({
            id: entry.id ?? "(unknown)",
            type: entry.type as "rule" | "filter-rule",
            time: entry.total,
            percent: percentOf(entry.total, total),
            count: entry.count
        }))
        .sort((a, b) => b.time - a.time);
    const slowestFiles = entries
        .filter((entry) => entry.type === "file" && entry.id !== undefined)
        .map((entry) => ({ filePath: entry.id as string, time: entry.total }))
        .sort((a, b) => b.time - a.time)
        .slice(0, MAX_FILES);
    return { total, files, phases, parsers, rules, slowestFiles };
};

// C0, DEL, and C1 control characters, which can control a terminal
// eslint-disable-next-line no-control-regex
const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f-\u009f]/g;
/**
 * Make a text safe for a cell of a Markdown table
 */
const escapeCell = (text: string) => {
    return text.replace(CONTROL_CHARACTERS, "").replace(/\\/g, "\\\\").replace(/\|/g, "\\|").replace(/`/g, "\\`");
};
const formatTime = (time: number) => time.toFixed(2);
const formatPercent = (percent: number) => `${percent.toFixed(1)}%`;
const toDisplayPath = (filePath: string, cwd: string) => {
    const relative = path.relative(cwd, filePath);
    return relative === "" || relative.startsWith("..") || path.isAbsolute(relative) ? filePath : relative;
};

const table = (headers: string[], align: ("left" | "right")[], rows: string[][]) => {
    const lines = [
        `| ${headers.join(" | ")} |`,
        `| ${align.map((value) => (value === "right" ? "---:" : "---")).join(" | ")} |`,
        ...rows.map((row) => `| ${row.join(" | ")} |`)
    ];
    return lines.join("\n");
};

/**
 * Format the summary as Markdown
 * @param report the summary
 * @param options.cwd file paths are shown relative to it
 */
export const formatProfileReportAsMarkdown = (report: TextlintProfileReport, options: { cwd: string }): string => {
    const sections: string[] = [];
    sections.push(`## textlint profile

Total: ${formatTime(report.total)} ms, ${report.files} ${report.files === 1 ? "file" : "files"}`);
    sections.push(`### Phases

${table(
    ["Phase", "Time (ms)", "%", "Count"],
    ["left", "right", "right", "right"],
    report.phases.map((phase) => [
        `${phase.depth > 0 ? "↳ " : ""}${phase.name}`,
        formatTime(phase.time),
        formatPercent(phase.percent),
        String(phase.count)
    ])
)}

Phases with ↳ are sums over the files, which are linted concurrently.`);
    if (report.parsers.length > 0) {
        sections.push(`### Parsers

${table(
    ["Plugin", "Time (ms)", "Parsed texts"],
    ["left", "right", "right"],
    report.parsers.map((parser) => [escapeCell(parser.id), formatTime(parser.time), String(parser.count)])
)}`);
    }
    if (report.rules.length > 0) {
        const shown = report.rules.slice(0, MAX_MARKDOWN_RULES);
        const rest = report.rules.length - shown.length;
        sections.push(`### Rules

${table(
    ["Rule", "Time (ms)", "%", "Calls"],
    ["left", "right", "right", "right"],
    shown.map((rule) => [
        `${escapeCell(rule.id)}${rule.type === "filter-rule" ? " (filter)" : ""}`,
        formatTime(rule.time),
        formatPercent(rule.percent),
        String(rule.count)
    ])
)}${
            rest > 0
                ? `\n\n${rest} more ${rest === 1 ? "rule is" : "rules are"} in the JSON output (\`--format json\`).`
                : ""
        }`);
    }
    if (report.slowestFiles.length > 0) {
        sections.push(`### Slowest files

${table(
    ["File", "Time (ms)"],
    ["left", "right"],
    report.slowestFiles.map((file) => [escapeCell(toDisplayPath(file.filePath, options.cwd)), formatTime(file.time)])
)}`);
    }
    return `${sections.join("\n\n")}\n`;
};

/**
 * Format the summary as JSON.
 * File paths are relative to `cwd`, as in Markdown.
 */
export const formatProfileReportAsJSON = (report: TextlintProfileReport, options: { cwd: string }): string => {
    const json: TextlintProfileReport = {
        ...report,
        slowestFiles: report.slowestFiles.map((file) => ({
            filePath: toDisplayPath(file.filePath, options.cwd),
            time: file.time
        }))
    };
    return `${JSON.stringify(json, null, 2)}\n`;
};
