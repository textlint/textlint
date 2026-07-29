import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import prettier from "prettier";

const { format, resolveConfig } = prettier;
const agentsDir = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.join(agentsDir, "output");
const prefix = process.argv[2] ?? "";
if (!/^(?:[a-z0-9]+-)*$/.test(prefix)) {
    throw new Error(`Invalid output prefix: ${prefix}`);
}

const readJson = (name) => JSON.parse(fs.readFileSync(path.join(outputDir, name), "utf8"));
const sourceFileNames = [
    `${prefix}01-facts.json`,
    `${prefix}02-candidates.json`,
    `${prefix}03-review.json`,
    `${prefix}04-requirement-clauses.json`
];
const facts = readJson(sourceFileNames[0]);
const candidates = readJson(sourceFileNames[1]);
const reviews = readJson(sourceFileNames[2]);
const requirementClauses = readJson(sourceFileNames[3]);

const countBy = (values, selector) =>
    Object.fromEntries(
        Object.entries(
            values.reduce((counts, value) => {
                const key = selector(value);
                counts[key] = (counts[key] ?? 0) + 1;
                return counts;
            }, {})
        ).sort(([left], [right]) => left.localeCompare(right))
    );

const artifactKind = (artifact) => {
    if (/^https:\/\/github\.com\/textlint\/textlint\/(?:issues|pull)\//u.test(artifact)) {
        return "github_issue_or_pr";
    }
    if (/(?:^|\/)(?:test|tests)\//u.test(artifact) || /\.test\.[cm]?[jt]sx?$/u.test(artifact)) {
        return "test";
    }
    if (/^docs\//u.test(artifact) || /\.(?:md|mdx)$/u.test(artifact)) {
        return "documentation";
    }
    return "implementation";
};

const reviewCounts = Object.fromEntries(
    Object.entries(
        reviews.reviews.reduce((counts, review) => {
            counts[review.reviewState] = (counts[review.reviewState] ?? 0) + 1;
            return counts;
        }, {})
    ).sort(([left], [right]) => left.localeCompare(right))
);

const viewModel = {
    featureSlice: requirementClauses.featureSlice,
    definition: requirementClauses.definition,
    interpretation: requirementClauses.interpretation,
    metrics: {
        facts: facts.facts.length,
        candidates: candidates.candidateClauses.length,
        reviews: reviews.reviews.length,
        requirementClauses: requirementClauses.requirementClauses.length,
        excludedCandidates: requirementClauses.excludedCandidates.length
    },
    factExtraction: {
        artifactKindCounts: countBy(facts.facts, (fact) => artifactKind(fact.source.artifact)),
        sourceKindCounts: countBy(facts.facts, (fact) => fact.factKind),
        sourceRoleCounts: countBy(facts.facts, (fact) => fact.sourceRole),
        facts: facts.facts.map((fact) => ({
            factId: fact.factId,
            statement: fact.statement,
            factKind: fact.factKind,
            sourceRole: fact.sourceRole,
            source: fact.source
        })),
        contradictions: facts.contradictions,
        uncertainties: facts.uncertainties,
        uninspectedAreas: facts.uninspectedAreas
    },
    candidateSynthesis: {
        candidateClauses: candidates.candidateClauses.map((candidate) => ({
            clauseId: candidate.clauseId,
            statement: candidate.statement,
            kind: candidate.kind,
            knowledgeType: candidate.knowledgeType,
            supportingFactRefs: candidate.supportingFactRefs,
            refutingFactRefs: candidate.refutingFactRefs,
            confidence: candidate.confidence,
            openQuestions: candidate.openQuestions
        })),
        rejectedCandidates: candidates.rejectedCandidates
    },
    independentReview: {
        reviews: reviews.reviews.map((review) => ({
            clauseId: review.clauseId,
            reviewState: review.reviewState,
            confidence: review.confidence,
            recommendedStatement: review.recommendedStatement,
            scopeCorrections: review.scopeCorrections,
            missingEvidence: review.missingEvidence,
            requiredHumanDecisions: review.requiredHumanDecisions
        })),
        reviewCounts,
        summary: reviews.summary
    },
    requirementClauses: requirementClauses.requirementClauses,
    excludedCandidates: requirementClauses.excludedCandidates,
    sourceFileNames,
    sources: [
        {
            label: "textlint CLI",
            url: "https://textlint.org/docs/cli/"
        },
        {
            label: "textlint Configuring",
            url: "https://textlint.org/docs/configuring/"
        },
        {
            label: "textlint Exit Status",
            url: "https://textlint.org/docs/faq/exit-status/"
        },
        {
            label: "textlint Formatter",
            url: "https://textlint.org/docs/formatter/"
        },
        {
            label: "textlint MCP",
            url: "https://textlint.org/docs/mcp/"
        },
        {
            label: "GitHub Issues",
            url: "https://docs.github.com/en/issues/tracking-your-work-with-issues/learning-about-issues/about-issues"
        }
    ]
};

const serializedData = JSON.stringify(viewModel).replaceAll("<", "\\u003c");
const destinationPath = path.join(outputDir, `${prefix}requirement-clauses-viewer.html`);

const html = `<!doctype html>
<html lang="ja">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="color-scheme" content="light dark" />
        <title>textlint Requirement Clause Review</title>
        <style>
            :root {
                color-scheme: light;
                --background: #f5f7fb;
                --surface: #ffffff;
                --surface-subtle: #f0f3f8;
                --foreground: #172033;
                --muted: #667085;
                --border: #d8deea;
                --primary: #3346c8;
                --primary-foreground: #ffffff;
                --supported: #137a4a;
                --supported-soft: #e6f5ec;
                --partial: #9a6100;
                --partial-soft: #fff3d6;
                --review: #a63d4a;
                --review-soft: #fdebed;
                --excluded: #596275;
                --excluded-soft: #edf0f4;
                --focus: #315efb;
                --shadow: 0 10px 30px rgba(31, 42, 68, 0.08);
            }

            @media (prefers-color-scheme: dark) {
                :root {
                    color-scheme: dark;
                    --background: #10131a;
                    --surface: #181d27;
                    --surface-subtle: #202735;
                    --foreground: #eef2f8;
                    --muted: #aeb7c8;
                    --border: #354052;
                    --primary: #9ba8ff;
                    --primary-foreground: #11162d;
                    --supported: #69d89a;
                    --supported-soft: #173b2a;
                    --partial: #f3bf59;
                    --partial-soft: #3e3012;
                    --review: #ff9ca8;
                    --review-soft: #481f27;
                    --excluded: #c2cad7;
                    --excluded-soft: #2a303c;
                    --focus: #a8b4ff;
                    --shadow: 0 10px 30px rgba(0, 0, 0, 0.24);
                }
            }

            * {
                box-sizing: border-box;
            }

            body {
                margin: 0;
                background: var(--background);
                color: var(--foreground);
                font-family:
                    Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans JP", sans-serif;
                line-height: 1.65;
            }

            button,
            input,
            select {
                font: inherit;
            }

            button,
            input,
            select,
            summary,
            a {
                outline-offset: 3px;
            }

            button:focus-visible,
            input:focus-visible,
            select:focus-visible,
            summary:focus-visible,
            a:focus-visible {
                outline: 3px solid var(--focus);
            }

            a {
                color: var(--primary);
            }

            code {
                font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
                overflow-wrap: anywhere;
            }

            .shell {
                width: min(1440px, calc(100% - 32px));
                margin: 0 auto;
                padding: 36px 0 64px;
            }

            .hero {
                display: grid;
                gap: 12px;
                margin-bottom: 24px;
            }

            .eyebrow {
                margin: 0;
                color: var(--primary);
                font-weight: 500;
                letter-spacing: 0.08em;
                text-transform: uppercase;
            }

            h1,
            h2,
            h3,
            p {
                margin-top: 0;
            }

            h1 {
                margin-bottom: 0;
                font-size: clamp(1.8rem, 4vw, 3rem);
                line-height: 1.2;
                font-weight: 500;
            }

            h2,
            h3 {
                font-weight: 500;
                line-height: 1.35;
            }

            .lede {
                max-width: 78ch;
                margin-bottom: 0;
                color: var(--muted);
            }

            .meta {
                display: flex;
                flex-wrap: wrap;
                gap: 8px 16px;
                color: var(--muted);
                font-size: 0.92rem;
            }

            .metrics,
            .pipeline-cards {
                display: grid;
                grid-template-columns: repeat(4, minmax(0, 1fr));
                gap: 12px;
                margin-bottom: 24px;
            }

            .metric,
            .panel,
            .pipeline-card,
            .clause-card,
            .empty-state {
                background: var(--surface);
                border: 1px solid var(--border);
                border-radius: 14px;
                box-shadow: var(--shadow);
            }

            .metric {
                padding: 18px;
            }

            .metric-value {
                display: block;
                font-size: 1.65rem;
                line-height: 1.2;
                font-weight: 500;
            }

            .metric-label {
                color: var(--muted);
            }

            .tabs {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                margin-bottom: 18px;
                border-bottom: 1px solid var(--border);
                padding-bottom: 10px;
            }

            .tab,
            .button {
                border: 1px solid var(--border);
                border-radius: 999px;
                background: var(--surface);
                color: var(--foreground);
                padding: 8px 14px;
                cursor: pointer;
            }

            .tab[aria-selected="true"],
            .button.primary {
                border-color: var(--primary);
                background: var(--primary);
                color: var(--primary-foreground);
            }

            .tab-panel[hidden] {
                display: none;
            }

            .panel {
                padding: 20px;
                margin-bottom: 16px;
            }

            .section-heading {
                display: flex;
                align-items: flex-start;
                justify-content: space-between;
                gap: 16px;
                margin-bottom: 16px;
            }

            .section-heading h2,
            .section-heading p {
                margin-bottom: 0;
            }

            .toolbar {
                display: grid;
                grid-template-columns: minmax(240px, 1fr) repeat(2, minmax(150px, 220px)) auto;
                gap: 12px;
                align-items: end;
                margin-bottom: 12px;
            }

            .control {
                display: grid;
                gap: 5px;
            }

            .control label,
            .control-label {
                color: var(--muted);
                font-size: 0.88rem;
            }

            input[type="search"],
            select {
                min-width: 0;
                width: 100%;
                border: 1px solid var(--border);
                border-radius: 10px;
                background: var(--surface);
                color: var(--foreground);
                padding: 10px 12px;
            }

            .checkbox-control {
                display: flex;
                align-items: center;
                gap: 8px;
                min-height: 44px;
                color: var(--muted);
            }

            .toolbar-actions {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                margin-bottom: 16px;
            }

            .result-count {
                margin-left: auto;
                color: var(--muted);
                align-self: center;
            }

            .status-overview {
                display: grid;
                gap: 8px;
                margin-bottom: 18px;
            }

            .status-bar {
                display: flex;
                min-height: 18px;
                overflow: hidden;
                border-radius: 999px;
                background: var(--surface-subtle);
            }

            .status-segment.supported {
                background: var(--supported);
            }

            .status-segment.partial {
                background: var(--partial);
            }

            .status-segment.review {
                background: var(--review);
            }

            .legend {
                display: flex;
                flex-wrap: wrap;
                gap: 8px 18px;
                color: var(--muted);
                font-size: 0.9rem;
            }

            .legend-item {
                display: inline-flex;
                align-items: center;
                gap: 6px;
            }

            .legend-dot {
                width: 10px;
                height: 10px;
                border-radius: 50%;
            }

            .legend-dot.supported {
                background: var(--supported);
            }

            .legend-dot.partial {
                background: var(--partial);
            }

            .legend-dot.review {
                background: var(--review);
            }

            .clause-list {
                display: grid;
                gap: 12px;
            }

            .clause-card {
                overflow: clip;
            }

            .clause-card > summary {
                display: grid;
                grid-template-columns: minmax(145px, auto) minmax(0, 1fr) auto;
                gap: 12px 18px;
                align-items: center;
                padding: 17px 18px;
                cursor: pointer;
                list-style-position: inside;
            }

            .clause-card[open] > summary {
                border-bottom: 1px solid var(--border);
            }

            .clause-id {
                font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
                font-size: 0.86rem;
                color: var(--muted);
            }

            .clause-statement {
                font-weight: 500;
            }

            .badge-row {
                display: flex;
                flex-wrap: wrap;
                justify-content: flex-end;
                gap: 6px;
            }

            .badge {
                display: inline-flex;
                align-items: center;
                border-radius: 999px;
                padding: 3px 9px;
                font-size: 0.8rem;
                white-space: nowrap;
            }

            .badge.supported {
                background: var(--supported-soft);
                color: var(--supported);
            }

            .badge.partial {
                background: var(--partial-soft);
                color: var(--partial);
            }

            .badge.review {
                background: var(--review-soft);
                color: var(--review);
            }

            .badge.excluded,
            .badge.neutral {
                background: var(--excluded-soft);
                color: var(--excluded);
            }

            .clause-body {
                display: grid;
                grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr);
                gap: 20px;
                padding: 20px;
            }

            .clause-section {
                min-width: 0;
            }

            .clause-section h3 {
                margin-bottom: 10px;
                font-size: 1rem;
            }

            .assessment {
                border-left: 4px solid var(--border);
                padding: 10px 12px;
                background: var(--surface-subtle);
                border-radius: 0 8px 8px 0;
                margin-bottom: 16px;
            }

            .assessment.supported {
                border-left-color: var(--supported);
            }

            .assessment.partial {
                border-left-color: var(--partial);
            }

            .assessment.review {
                border-left-color: var(--review);
            }

            .assessment p {
                margin-bottom: 4px;
            }

            .definition-list {
                display: grid;
                grid-template-columns: minmax(95px, 0.3fr) minmax(0, 1fr);
                gap: 7px 12px;
                margin: 0;
            }

            .definition-list dt {
                color: var(--muted);
            }

            .definition-list dd {
                margin: 0;
                overflow-wrap: anywhere;
            }

            .evidence-list,
            .gap-list,
            .plain-list {
                display: grid;
                gap: 10px;
                margin: 0;
                padding: 0;
                list-style: none;
            }

            .evidence-item,
            .gap-item,
            .plain-item {
                border-top: 1px solid var(--border);
                padding-top: 10px;
            }

            .evidence-item:first-child,
            .gap-item:first-child,
            .plain-item:first-child {
                border-top: 0;
                padding-top: 0;
            }

            .evidence-meta,
            .gap-meta {
                display: flex;
                flex-wrap: wrap;
                gap: 6px 10px;
                margin-bottom: 4px;
                color: var(--muted);
                font-size: 0.84rem;
            }

            .gap-item.open {
                border-left: 3px solid var(--review);
                padding-left: 10px;
            }

            .gap-item.applied {
                border-left: 3px solid var(--partial);
                padding-left: 10px;
            }

            .empty-state {
                padding: 28px;
                text-align: center;
                color: var(--muted);
            }

            .pipeline-card {
                padding: 16px;
            }

            .pipeline-card h3 {
                margin-bottom: 4px;
                font-size: 1rem;
            }

            .pipeline-card p {
                margin-bottom: 0;
                color: var(--muted);
            }

            .stage-number {
                display: inline-grid;
                place-items: center;
                width: 28px;
                height: 28px;
                margin-bottom: 10px;
                border-radius: 50%;
                background: var(--primary);
                color: var(--primary-foreground);
                font-weight: 500;
            }

            .stage-grid {
                display: grid;
                grid-template-columns: repeat(2, minmax(0, 1fr));
                gap: 16px;
            }

            details.raw-list {
                margin-top: 14px;
            }

            details.raw-list > summary {
                cursor: pointer;
                color: var(--primary);
            }

            .table-responsive {
                overflow-x: auto;
                margin-top: 12px;
            }

            table {
                width: 100%;
                border-collapse: collapse;
                font-size: 0.9rem;
            }

            th,
            td {
                padding: 10px;
                border-bottom: 1px solid var(--border);
                text-align: left;
                vertical-align: top;
            }

            th {
                color: var(--muted);
                font-weight: 500;
            }

            footer {
                margin-top: 28px;
                padding-top: 18px;
                border-top: 1px solid var(--border);
                color: var(--muted);
                font-size: 0.9rem;
            }

            footer p {
                margin-bottom: 6px;
            }

            @media (max-width: 900px) {
                .metrics,
                .pipeline-cards {
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                }

                .toolbar {
                    grid-template-columns: 1fr 1fr;
                }

                .clause-body,
                .stage-grid {
                    grid-template-columns: 1fr;
                }
            }

            @media (max-width: 620px) {
                .shell {
                    width: min(100% - 20px, 1440px);
                    padding-top: 20px;
                }

                .metrics,
                .pipeline-cards,
                .toolbar {
                    grid-template-columns: 1fr;
                }

                .clause-card > summary {
                    grid-template-columns: 1fr;
                }

                .badge-row {
                    justify-content: flex-start;
                }

                .definition-list {
                    grid-template-columns: 1fr;
                }

                .definition-list dd {
                    margin-bottom: 8px;
                }
            }
        </style>
    </head>
    <body>
        <div class="shell">
            <header class="hero">
                <p class="eyebrow">Repository + GitHub Evidence Review</p>
                <h1>textlint Requirement Clause</h1>
                <p class="lede" id="definition"></p>
                <div class="meta">
                    <span id="feature-name"></span>
                    <span>Baseline: <code id="baseline"></code></span>
                    <span>正式Requirement化には人の承認が必要</span>
                </div>
            </header>

            <section class="metrics" aria-label="検証件数">
                <article class="metric">
                    <strong class="metric-value" id="metric-facts">0</strong>
                    <span class="metric-label">抽出Fact</span>
                </article>
                <article class="metric">
                    <strong class="metric-value" id="metric-candidates">0</strong>
                    <span class="metric-label">Candidate Clause</span>
                </article>
                <article class="metric">
                    <strong class="metric-value" id="metric-reviewed">0</strong>
                    <span class="metric-label">独立Review済み</span>
                </article>
                <article class="metric">
                    <strong class="metric-value" id="metric-promoted">0</strong>
                    <span class="metric-label">Requirement Clause候補</span>
                </article>
            </section>

            <nav class="tabs" role="tablist" aria-label="表示切り替え">
                <button class="tab" type="button" role="tab" aria-selected="true" aria-controls="clauses-panel" id="clauses-tab">
                    Clauseビュー
                </button>
                <button class="tab" type="button" role="tab" aria-selected="false" aria-controls="pipeline-panel" id="pipeline-tab">
                    3段階の検証
                </button>
                <button class="tab" type="button" role="tab" aria-selected="false" aria-controls="excluded-panel" id="excluded-tab">
                    除外候補
                </button>
            </nav>

            <main>
                <section class="tab-panel" id="clauses-panel" role="tabpanel" aria-labelledby="clauses-tab">
                    <div class="panel">
                        <div class="section-heading">
                            <div>
                                <h2>Requirement Clause候補</h2>
                                <p>条件、Baselineでの判定、Evidence、GapをClause単位で確認できます。</p>
                            </div>
                        </div>

                        <div class="status-overview">
                            <div class="status-bar" id="status-bar" aria-label="Review状態の分布"></div>
                            <div class="legend" id="status-legend"></div>
                        </div>

                        <form class="toolbar" id="filter-form">
                            <div class="control">
                                <label for="search">Clauseを検索</label>
                                <input id="search" type="search" placeholder="ID、条件、Evidence、Gap" autocomplete="off" />
                            </div>
                            <div class="control">
                                <label for="status-filter">Review状態</label>
                                <select id="status-filter">
                                    <option value="all">すべて</option>
                                </select>
                            </div>
                            <div class="control">
                                <label for="kind-filter">Clause種別</label>
                                <select id="kind-filter">
                                    <option value="all">すべて</option>
                                </select>
                            </div>
                            <label class="checkbox-control">
                                <input id="open-gap-filter" type="checkbox" />
                                未解決Gapのみ
                            </label>
                        </form>

                        <div class="toolbar-actions">
                            <button class="button" type="button" id="expand-visible">表示中を展開</button>
                            <button class="button" type="button" id="collapse-all">すべて閉じる</button>
                            <button class="button" type="button" id="clear-filters">絞り込み解除</button>
                            <span class="result-count" id="result-count" aria-live="polite"></span>
                        </div>

                        <div class="clause-list" id="clause-list"></div>
                    </div>
                </section>

                <section class="tab-panel" id="pipeline-panel" role="tabpanel" aria-labelledby="pipeline-tab" hidden>
                    <div class="pipeline-cards" id="pipeline-cards"></div>
                    <div id="pipeline-details"></div>
                </section>

                <section class="tab-panel" id="excluded-panel" role="tabpanel" aria-labelledby="excluded-tab" hidden>
                    <div class="panel">
                        <div class="section-heading">
                            <div>
                                <h2>Requirement Clauseから除外した候補</h2>
                                <p>実装詳細またはEvidence不足として、最終Clauseへ昇格しなかった項目です。</p>
                            </div>
                        </div>
                        <div class="clause-list" id="excluded-list"></div>
                    </div>
                </section>
            </main>

            <footer>
                <p id="source-files"></p>
                <p id="official-sources"></p>
            </footer>
        </div>

        <script type="application/json" id="viewer-data">${serializedData}</script>
        <script>
            (function () {
                "use strict";

                var data = JSON.parse(document.getElementById("viewer-data").textContent);
                var stateMeta = {
                    supported_candidate: { label: "支持", className: "supported" },
                    partially_supported: { label: "範囲修正付き", className: "partial" },
                    human_review_required: { label: "人手判断", className: "review" },
                    conflicting: { label: "Evidence衝突", className: "review" },
                    insufficient_evidence: { label: "Evidence不足", className: "review" },
                    historical_or_stale: { label: "過去・古い", className: "excluded" },
                    rejected: { label: "棄却", className: "excluded" },
                    implementation_detail: { label: "実装詳細", className: "excluded" }
                };

                function createElement(tagName, className, text) {
                    var node = document.createElement(tagName);
                    if (className) {
                        node.className = className;
                    }
                    if (text !== undefined && text !== null) {
                        node.textContent = String(text);
                    }
                    return node;
                }

                function appendText(parent, tagName, className, text) {
                    var node = createElement(tagName, className, text);
                    parent.appendChild(node);
                    return node;
                }

                function appendList(parent, items, emptyText) {
                    var list = createElement("ul", "plain-list");
                    if (!items || items.length === 0) {
                        appendText(list, "li", "plain-item", emptyText || "なし");
                    } else {
                        items.forEach(function (item) {
                            appendText(list, "li", "plain-item", item);
                        });
                    }
                    parent.appendChild(list);
                    return list;
                }

                function formatValue(value) {
                    if (value === null || value === undefined || value === "") {
                        return "なし";
                    }
                    if (Array.isArray(value)) {
                        return value.length ? value.map(formatValue).join(" / ") : "なし";
                    }
                    if (typeof value === "object") {
                        return Object.entries(value)
                            .map(function (entry) {
                                return entry[0] + ": " + formatValue(entry[1]);
                            })
                            .join(" / ");
                    }
                    return String(value);
                }

                function artifactHref(artifact) {
                    if (artifact.startsWith("http://") || artifact.startsWith("https://")) {
                        return artifact;
                    }
                    if (artifact.indexOf("agents/output/") === 0) {
                        return "./" + artifact.slice("agents/output/".length);
                    }
                    return "../../" + artifact;
                }

                function badge(text, className) {
                    return createElement("span", "badge " + (className || "neutral"), text);
                }

                function statusFor(reviewState) {
                    return stateMeta[reviewState] || { label: reviewState, className: "neutral" };
                }

                function renderHeader() {
                    document.getElementById("definition").textContent = data.definition;
                    document.getElementById("feature-name").textContent = data.featureSlice.name;
                    document.getElementById("baseline").textContent = formatValue(data.featureSlice.baseline);
                    document.getElementById("metric-facts").textContent = data.metrics.facts;
                    document.getElementById("metric-candidates").textContent = data.metrics.candidates;
                    document.getElementById("metric-reviewed").textContent = data.metrics.reviews;
                    document.getElementById("metric-promoted").textContent = data.metrics.requirementClauses;
                }

                function renderStatusOverview() {
                    var bar = document.getElementById("status-bar");
                    var legend = document.getElementById("status-legend");
                    var total = data.requirementClauses.length;
                    Array.from(
                        new Set(
                            data.requirementClauses.map(function (clause) {
                                return clause.assessment.reviewState;
                            })
                        )
                    ).forEach(function (state) {
                        var meta = statusFor(state);
                        var count = data.requirementClauses.filter(function (clause) {
                            return clause.assessment.reviewState === state;
                        }).length;
                        if (count > 0) {
                            var segment = createElement("span", "status-segment " + meta.className);
                            segment.style.width = String((count / total) * 100) + "%";
                            segment.title = meta.label + ": " + count + "件";
                            bar.appendChild(segment);

                            var item = createElement("span", "legend-item");
                            item.appendChild(createElement("span", "legend-dot " + meta.className));
                            item.appendChild(document.createTextNode(meta.label + " " + count + "件"));
                            legend.appendChild(item);
                        }
                    });
                }

                function definitionRow(list, term, value) {
                    appendText(list, "dt", "", term);
                    appendText(list, "dd", "", formatValue(value));
                }

                function renderCondition(clause) {
                    var section = createElement("section", "clause-section");
                    appendText(section, "h3", "", "判定条件");
                    var list = createElement("dl", "definition-list");
                    definitionRow(list, "Subject", clause.condition.subject);
                    definitionRow(list, "Actors", clause.condition.scope.actors);
                    definitionRow(list, "Environment", clause.condition.scope.environments);
                    definitionRow(list, "Resources", clause.condition.scope.resources);
                    definitionRow(list, "Other conditions", clause.condition.scope.otherConditions);
                    definitionRow(list, "Preconditions", clause.condition.preconditions);
                    definitionRow(list, "Trigger", clause.condition.trigger.event);
                    definitionRow(list, "Expected", clause.condition.expected.predicate);
                    definitionRow(list, "Value", clause.condition.expected.value);
                    definitionRow(list, "Timing", clause.condition.timing.relation);
                    definitionRow(list, "Exceptions", clause.condition.exceptions);
                    section.appendChild(list);
                    return section;
                }

                function renderEvidence(clause) {
                    var section = createElement("section", "clause-section");
                    appendText(section, "h3", "", "Evidence");
                    var list = createElement("ul", "evidence-list");
                    function appendEvidence(evidence, label, description, className) {
                        var item = createElement("li", "evidence-item");
                        var meta = createElement("div", "evidence-meta");
                        meta.appendChild(badge(label, className || "neutral"));
                        if (evidence.sourceRole) {
                            meta.appendChild(badge(evidence.sourceRole, "neutral"));
                        }
                        var link = createElement("a", "", evidence.artifact + " — " + evidence.locator);
                        link.href = artifactHref(evidence.artifact);
                        if (evidence.artifact.startsWith("http://") || evidence.artifact.startsWith("https://")) {
                            link.target = "_blank";
                            link.rel = "noreferrer";
                        }
                        meta.appendChild(link);
                        item.appendChild(meta);
                        appendText(item, "p", "", description);
                        list.appendChild(item);
                    }
                    clause.evidence.supportingFacts.forEach(function (fact) {
                        appendEvidence(fact, fact.factId, fact.statement, "neutral");
                    });
                    clause.evidence.refutingFacts.forEach(function (fact) {
                        appendEvidence(fact, "反証 " + fact.factId, fact.statement, "review");
                    });
                    clause.evidence.reviewSupportingEvidence.forEach(function (evidence) {
                        appendEvidence(evidence, "Review支持", evidence.reason, "supported");
                    });
                    clause.evidence.reviewCounterEvidence.forEach(function (evidence) {
                        appendEvidence(evidence, "Review反証", evidence.reason, "review");
                    });
                    section.appendChild(list);
                    return section;
                }

                function renderGaps(clause) {
                    var section = createElement("section", "clause-section");
                    appendText(section, "h3", "", "Gap / Review補正");
                    var list = createElement("ul", "gap-list");
                    if (!clause.gaps.length) {
                        appendText(list, "li", "gap-item", "未解決Gapなし");
                    } else {
                        clause.gaps.forEach(function (gap) {
                            var isOpen = gap.status === "open";
                            var item = createElement("li", "gap-item " + (isOpen ? "open" : "applied"));
                            var meta = createElement("div", "gap-meta");
                            meta.appendChild(badge(gap.kind, isOpen ? "review" : "partial"));
                            meta.appendChild(badge(isOpen ? "未解決" : "Statementへ反映済み", isOpen ? "review" : "partial"));
                            if (gap.artifact) {
                                var link = createElement("a", "", gap.artifact + " — " + gap.locator);
                                link.href = artifactHref(gap.artifact);
                                if (gap.artifact.startsWith("http://") || gap.artifact.startsWith("https://")) {
                                    link.target = "_blank";
                                    link.rel = "noreferrer";
                                }
                                meta.appendChild(link);
                            }
                            item.appendChild(meta);
                            appendText(item, "p", "", gap.description);
                            list.appendChild(item);
                        });
                    }
                    section.appendChild(list);
                    return section;
                }

                function renderClause(clause) {
                    var meta = statusFor(clause.assessment.reviewState);
                    var details = createElement("details", "clause-card");
                    details.dataset.reviewState = clause.assessment.reviewState;
                    details.dataset.kind = clause.kind;
                    details.id = clause.clauseId.toLowerCase();
                    if (clause.assessment.reviewState === "human_review_required") {
                        details.open = true;
                    }

                    var summary = createElement("summary");
                    appendText(summary, "span", "clause-id", clause.clauseId);
                    appendText(summary, "span", "clause-statement", clause.statement);
                    var badges = createElement("span", "badge-row");
                    badges.appendChild(badge(meta.label, meta.className));
                    badges.appendChild(badge(clause.kind, "neutral"));
                    summary.appendChild(badges);
                    details.appendChild(summary);

                    var body = createElement("div", "clause-body");
                    var left = createElement("div");
                    var assessment = createElement("div", "assessment " + meta.className);
                    appendText(assessment, "p", "", clause.assessment.answer);
                    appendText(
                        assessment,
                        "small",
                        "",
                        "confidence " + Math.round(clause.assessment.confidence * 100) + "% / " + clause.knowledgeType
                    );
                    left.appendChild(assessment);
                    left.appendChild(renderCondition(clause));

                    var right = createElement("div");
                    right.appendChild(renderEvidence(clause));
                    right.appendChild(renderGaps(clause));
                    body.appendChild(left);
                    body.appendChild(right);
                    details.appendChild(body);
                    return details;
                }

                var clauseList = document.getElementById("clause-list");
                var searchInput = document.getElementById("search");
                var statusFilter = document.getElementById("status-filter");
                var kindFilter = document.getElementById("kind-filter");
                var gapFilter = document.getElementById("open-gap-filter");

                function searchableText(clause) {
                    return [
                        clause.clauseId,
                        clause.statement,
                        clause.sourceCandidateStatement,
                        clause.kind,
                        clause.knowledgeType,
                        clause.assessment.answer,
                        clause.evidence.supportingFacts.map(function (fact) {
                            return fact.statement + " " + fact.artifact;
                        }),
                        clause.gaps.map(function (gap) {
                            return gap.description;
                        })
                    ]
                        .flat(Infinity)
                        .join(" ")
                        .toLowerCase();
                }

                function filteredClauses() {
                    var query = searchInput.value.trim().toLowerCase();
                    return data.requirementClauses.filter(function (clause) {
                        var statusMatches =
                            statusFilter.value === "all" || clause.assessment.reviewState === statusFilter.value;
                        var kindMatches = kindFilter.value === "all" || clause.kind === kindFilter.value;
                        var gapMatches =
                            !gapFilter.checked ||
                            clause.gaps.some(function (gap) {
                                return gap.status === "open";
                            });
                        var queryMatches = !query || searchableText(clause).indexOf(query) !== -1;
                        return statusMatches && kindMatches && gapMatches && queryMatches;
                    });
                }

                function renderClauses() {
                    var clauses = filteredClauses();
                    clauseList.replaceChildren();
                    clauses.forEach(function (clause) {
                        clauseList.appendChild(renderClause(clause));
                    });
                    if (!clauses.length) {
                        clauseList.appendChild(createElement("div", "empty-state", "条件に一致するClauseはありません。"));
                    }
                    document.getElementById("result-count").textContent = clauses.length + " / " + data.requirementClauses.length + "件";
                }

                function populateKindFilter() {
                    Array.from(
                        new Set(
                            data.requirementClauses.map(function (clause) {
                                return clause.kind;
                            })
                        )
                    )
                        .sort()
                        .forEach(function (kind) {
                            var option = createElement("option", "", kind);
                            option.value = kind;
                            kindFilter.appendChild(option);
                        });
                }

                function populateStatusFilter() {
                    Array.from(
                        new Set(
                            data.requirementClauses.map(function (clause) {
                                return clause.assessment.reviewState;
                            })
                        )
                    )
                        .sort()
                        .forEach(function (reviewState) {
                            var option = createElement("option", "", statusFor(reviewState).label);
                            option.value = reviewState;
                            statusFilter.appendChild(option);
                        });
                }

                function pipelineCard(number, title, body) {
                    var card = createElement("article", "pipeline-card");
                    appendText(card, "span", "stage-number", number);
                    appendText(card, "h3", "", title);
                    appendText(card, "p", "", body);
                    return card;
                }

                function renderFactsTable() {
                    var wrapper = createElement("div", "table-responsive");
                    var table = createElement("table");
                    var head = createElement("thead");
                    var headRow = createElement("tr");
                    ["Fact", "Kind", "Role", "Statement", "Evidence"].forEach(function (heading) {
                        appendText(headRow, "th", "", heading);
                    });
                    head.appendChild(headRow);
                    table.appendChild(head);
                    var body = createElement("tbody");
                    data.factExtraction.facts.forEach(function (fact) {
                        var row = createElement("tr");
                        appendText(row, "td", "", fact.factId);
                        appendText(row, "td", "", fact.factKind);
                        appendText(row, "td", "", fact.sourceRole);
                        appendText(row, "td", "", fact.statement);
                        var sourceCell = createElement("td");
                        var link = createElement("a", "", fact.source.artifact + " — " + fact.source.locator);
                        link.href = artifactHref(fact.source.artifact);
                        if (fact.source.artifact.startsWith("http://") || fact.source.artifact.startsWith("https://")) {
                            link.target = "_blank";
                            link.rel = "noreferrer";
                        }
                        sourceCell.appendChild(link);
                        row.appendChild(sourceCell);
                        body.appendChild(row);
                    });
                    table.appendChild(body);
                    wrapper.appendChild(table);
                    return wrapper;
                }

                function renderCandidatesTable() {
                    var wrapper = createElement("div", "table-responsive");
                    var table = createElement("table");
                    var head = createElement("thead");
                    var headRow = createElement("tr");
                    ["Candidate", "Knowledge", "Statement", "Fact refs"].forEach(function (heading) {
                        appendText(headRow, "th", "", heading);
                    });
                    head.appendChild(headRow);
                    table.appendChild(head);
                    var body = createElement("tbody");
                    data.candidateSynthesis.candidateClauses.forEach(function (candidate) {
                        var row = createElement("tr");
                        appendText(row, "td", "", candidate.clauseId);
                        appendText(row, "td", "", candidate.knowledgeType);
                        appendText(row, "td", "", candidate.statement);
                        appendText(row, "td", "", candidate.supportingFactRefs.join(", "));
                        body.appendChild(row);
                    });
                    table.appendChild(body);
                    wrapper.appendChild(table);
                    return wrapper;
                }

                function renderReviewsTable() {
                    var wrapper = createElement("div", "table-responsive");
                    var table = createElement("table");
                    var head = createElement("thead");
                    var headRow = createElement("tr");
                    ["Clause", "Review", "Recommended statement", "Open decision"].forEach(function (heading) {
                        appendText(headRow, "th", "", heading);
                    });
                    head.appendChild(headRow);
                    table.appendChild(head);
                    var body = createElement("tbody");
                    data.independentReview.reviews.forEach(function (review) {
                        var row = createElement("tr");
                        appendText(row, "td", "", review.clauseId);
                        var stateCell = createElement("td");
                        var meta = statusFor(review.reviewState);
                        stateCell.appendChild(badge(meta.label, meta.className));
                        row.appendChild(stateCell);
                        appendText(row, "td", "", review.recommendedStatement || "採用しない");
                        appendText(row, "td", "", review.requiredHumanDecisions.join(" / ") || "なし");
                        body.appendChild(row);
                    });
                    table.appendChild(body);
                    wrapper.appendChild(table);
                    return wrapper;
                }

                function sectionPanel(title, summary) {
                    var panel = createElement("section", "panel");
                    var heading = createElement("div", "section-heading");
                    var copy = createElement("div");
                    appendText(copy, "h2", "", title);
                    appendText(copy, "p", "", summary);
                    heading.appendChild(copy);
                    panel.appendChild(heading);
                    return panel;
                }

                function renderPipeline() {
                    var cards = document.getElementById("pipeline-cards");
                    cards.appendChild(
                        pipelineCard(
                            "1",
                            "Artifact → Fact",
                            data.metrics.facts +
                                " Fact / " +
                                data.factExtraction.contradictions.length +
                                " contradiction / " +
                                data.factExtraction.uncertainties.length +
                                " uncertainty"
                        )
                    );
                    cards.appendChild(pipelineCard("2", "Fact → Candidate", data.metrics.candidates + " Candidate / " + data.candidateSynthesis.rejectedCandidates.length + " rejected"));
                    cards.appendChild(pipelineCard("3", "Independent Review", data.metrics.reviews + " Review / 全Candidateを1回ずつ検証"));
                    cards.appendChild(pipelineCard("4", "統合", data.metrics.requirementClauses + " Clause / " + data.metrics.excludedCandidates + " excluded"));

                    var container = document.getElementById("pipeline-details");
                    var factPanel = sectionPanel(
                        "1. ArtifactからFactを抽出",
                        "推測を避け、Repository ArtifactとGitHubの履歴EvidenceへRevisionと位置を付けたFact台帳です。"
                    );
                    var factGrid = createElement("div", "stage-grid");
                    var contradictions = createElement("div");
                    appendText(contradictions, "h3", "", "Fact種別");
                    appendList(
                        contradictions,
                        Object.entries(data.factExtraction.sourceKindCounts).map(function (entry) {
                            return entry[0] + ": " + entry[1] + "件";
                        }),
                        "なし"
                    );
                    appendText(contradictions, "h3", "", "Artifact種別");
                    appendList(
                        contradictions,
                        Object.entries(data.factExtraction.artifactKindCounts).map(function (entry) {
                            return entry[0] + ": " + entry[1] + "件";
                        }),
                        "なし"
                    );
                    appendText(contradictions, "h3", "", "Evidence role");
                    appendList(
                        contradictions,
                        Object.entries(data.factExtraction.sourceRoleCounts).map(function (entry) {
                            return entry[0] + ": " + entry[1] + "件";
                        }),
                        "なし"
                    );
                    appendText(contradictions, "h3", "", "矛盾 " + data.factExtraction.contradictions.length + "件");
                    appendList(
                        contradictions,
                        data.factExtraction.contradictions.map(function (item) {
                            return item.description + " [" + item.factRefs.join(", ") + "]";
                        }),
                        "なし"
                    );
                    var uncertainties = createElement("div");
                    appendText(uncertainties, "h3", "", "未確認 " + data.factExtraction.uncertainties.length + "件");
                    appendList(
                        uncertainties,
                        data.factExtraction.uncertainties.map(function (item) {
                            return item.question + " — " + item.reason;
                        }),
                        "なし"
                    );
                    factGrid.appendChild(contradictions);
                    factGrid.appendChild(uncertainties);
                    factPanel.appendChild(factGrid);
                    var uninspectedDetails = createElement("details", "raw-list");
                    appendText(
                        uninspectedDetails,
                        "summary",
                        "",
                        "未調査領域 " + data.factExtraction.uninspectedAreas.length + "件を表示"
                    );
                    appendList(
                        uninspectedDetails,
                        data.factExtraction.uninspectedAreas.map(function (item) {
                            return item.area + " — " + item.reason;
                        }),
                        "なし"
                    );
                    factPanel.appendChild(uninspectedDetails);
                    var factDetails = createElement("details", "raw-list");
                    appendText(factDetails, "summary", "", "Fact " + data.metrics.facts + "件を表示");
                    factDetails.appendChild(renderFactsTable());
                    factPanel.appendChild(factDetails);
                    container.appendChild(factPanel);

                    var candidatePanel = sectionPanel("2. FactからCandidate Clauseを合成", "一つの主要な判定事項だけを持つCandidateへ正規化した結果です。");
                    var rejected = createElement("div");
                    appendText(rejected, "h3", "", "この段階で棄却した候補 " + data.candidateSynthesis.rejectedCandidates.length + "件");
                    appendList(
                        rejected,
                        data.candidateSynthesis.rejectedCandidates.map(function (item) {
                            return item.statement + " — " + item.reason;
                        }),
                        "なし"
                    );
                    candidatePanel.appendChild(rejected);
                    var candidateDetails = createElement("details", "raw-list");
                    appendText(candidateDetails, "summary", "", "Candidate " + data.metrics.candidates + "件を表示");
                    candidateDetails.appendChild(renderCandidatesTable());
                    candidatePanel.appendChild(candidateDetails);
                    container.appendChild(candidatePanel);

                    var reviewPanel = sectionPanel("3. 反証とIndependent Review", "別経路、例外、テストの弱さ、文書との矛盾から全Candidateを再評価した結果です。");
                    var reviewList = createElement("div", "legend");
                    Object.entries(data.independentReview.reviewCounts).forEach(function (entry) {
                        var meta = statusFor(entry[0]);
                        var item = createElement("span", "legend-item");
                        item.appendChild(badge(meta.label, meta.className));
                        item.appendChild(document.createTextNode(entry[1] + "件"));
                        reviewList.appendChild(item);
                    });
                    reviewPanel.appendChild(reviewList);
                    var reviewDetails = createElement("details", "raw-list");
                    appendText(reviewDetails, "summary", "", "Review " + data.metrics.reviews + "件を表示");
                    reviewDetails.appendChild(renderReviewsTable());
                    reviewPanel.appendChild(reviewDetails);
                    container.appendChild(reviewPanel);
                }

                function renderExcluded() {
                    var container = document.getElementById("excluded-list");
                    data.excludedCandidates.forEach(function (item) {
                        var details = createElement("details", "clause-card");
                        var summary = createElement("summary");
                        appendText(summary, "span", "clause-id", item.clauseId);
                        appendText(summary, "span", "clause-statement", item.statement);
                        var badges = createElement("span", "badge-row");
                        badges.appendChild(badge("実装詳細", "excluded"));
                        summary.appendChild(badges);
                        details.appendChild(summary);
                        var body = createElement("div", "clause-body");
                        var left = createElement("section", "clause-section");
                        appendText(left, "h3", "", "除外理由");
                        appendText(left, "p", "", item.reason);
                        body.appendChild(left);
                        var right = createElement("section", "clause-section");
                        appendText(right, "h3", "", "Review Gap");
                        appendList(
                            right,
                            item.gaps.map(function (gap) {
                                return gap.description;
                            }),
                            "なし"
                        );
                        body.appendChild(right);
                        details.appendChild(body);
                        container.appendChild(details);
                    });
                }

                function setupTabs() {
                    var tabs = Array.from(document.querySelectorAll('[role="tab"]'));
                    tabs.forEach(function (tab) {
                        tab.addEventListener("click", function () {
                            tabs.forEach(function (otherTab) {
                                var selected = otherTab === tab;
                                otherTab.setAttribute("aria-selected", String(selected));
                                document.getElementById(otherTab.getAttribute("aria-controls")).hidden = !selected;
                            });
                        });
                    });
                }

                function renderFooter() {
                    var sourceFiles = document.getElementById("source-files");
                    sourceFiles.appendChild(document.createTextNode("Source: "));
                    data.sourceFileNames.forEach(
                        function (fileName, index, files) {
                            var link = createElement("a", "", fileName);
                            link.href = "./" + fileName;
                            sourceFiles.appendChild(link);
                            if (index < files.length - 1) {
                                sourceFiles.appendChild(document.createTextNode(" / "));
                            }
                        }
                    );

                    var officialSources = document.getElementById("official-sources");
                    officialSources.appendChild(document.createTextNode("Official reference: "));
                    data.sources.forEach(function (source, index) {
                        var link = createElement("a", "", source.label);
                        link.href = source.url;
                        link.target = "_blank";
                        link.rel = "noreferrer";
                        officialSources.appendChild(link);
                        if (index < data.sources.length - 1) {
                            officialSources.appendChild(document.createTextNode(" / "));
                        }
                    });
                }

                document.getElementById("filter-form").addEventListener("submit", function (event) {
                    event.preventDefault();
                });
                [searchInput, statusFilter, kindFilter, gapFilter].forEach(function (control) {
                    control.addEventListener(control === searchInput ? "input" : "change", renderClauses);
                });
                document.getElementById("expand-visible").addEventListener("click", function () {
                    clauseList.querySelectorAll("details.clause-card").forEach(function (details) {
                        details.open = true;
                    });
                });
                document.getElementById("collapse-all").addEventListener("click", function () {
                    document.querySelectorAll("details.clause-card").forEach(function (details) {
                        details.open = false;
                    });
                });
                document.getElementById("clear-filters").addEventListener("click", function () {
                    searchInput.value = "";
                    statusFilter.value = "all";
                    kindFilter.value = "all";
                    gapFilter.checked = false;
                    renderClauses();
                });

                renderHeader();
                renderStatusOverview();
                populateStatusFilter();
                populateKindFilter();
                renderClauses();
                renderPipeline();
                renderExcluded();
                renderFooter();
                setupTabs();
            })();
        </script>
    </body>
</html>
`;

const prettierOptions = (await resolveConfig(destinationPath)) ?? {};
const formattedHtml = await format(html, {
    ...prettierOptions,
    filepath: destinationPath
});
fs.writeFileSync(destinationPath, formattedHtml);

console.log(
    JSON.stringify({
        destination: path.relative(path.resolve(agentsDir, ".."), destinationPath),
        bytes: Buffer.byteLength(formattedHtml),
        clauses: viewModel.requirementClauses.length
    })
);
