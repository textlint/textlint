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
const factsFileName = `${prefix}01-facts.json`;
const candidatesFileName = `${prefix}02-candidates.json`;
const reviewsFileName = `${prefix}03-review.json`;
const destinationFileName = `${prefix}04-requirement-clauses.json`;
const factsPath = path.join(outputDir, factsFileName);
const candidatesPath = path.join(outputDir, candidatesFileName);
const reviewsPath = path.join(outputDir, reviewsFileName);
const destinationPath = path.join(outputDir, destinationFileName);

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, "utf8"));
const factsDocument = readJson(factsPath);
const candidatesDocument = readJson(candidatesPath);
const reviewsDocument = readJson(reviewsPath);

const factsById = new Map(factsDocument.facts.map((fact) => [fact.factId, fact]));
const candidatesById = new Map(candidatesDocument.candidateClauses.map((candidate) => [candidate.clauseId, candidate]));
const reviewsById = new Map(reviewsDocument.reviews.map((review) => [review.clauseId, review]));

const assertUnique = (values, label) => {
    if (new Set(values).size !== values.length) {
        throw new Error(`${label} contains duplicate identifiers`);
    }
};

assertUnique([...factsById.keys()], "facts");
assertUnique([...candidatesById.keys()], "candidate clauses");
assertUnique([...reviewsById.keys()], "reviews");

if (candidatesById.size !== reviewsById.size) {
    throw new Error("Every candidate clause must have exactly one review");
}

for (const clauseId of candidatesById.keys()) {
    if (!reviewsById.has(clauseId)) {
        throw new Error(`Missing review for ${clauseId}`);
    }
}

const approvedIds = reviewsDocument.summary.approvedForHumanReview;
const rejectedIds = reviewsDocument.summary.rejected;
assertUnique([...approvedIds, ...rejectedIds], "review summary");

if (approvedIds.length + rejectedIds.length !== candidatesById.size) {
    throw new Error("Review summary must classify every candidate exactly once");
}

const assessmentResult = (reviewState) => {
    switch (reviewState) {
        case "supported_candidate":
            return "supported_at_baseline";
        case "partially_supported":
            return "supported_only_with_review_corrections";
        case "human_review_required":
        case "conflicting":
            return "undetermined_due_to_conflicting_evidence";
        case "insufficient_evidence":
            return "undetermined_due_to_missing_evidence";
        default:
            return "not_promoted_to_requirement_clause";
    }
};

const assessmentAnswer = (reviewState) => {
    switch (reviewState) {
        case "supported_candidate":
            return "指定Baselineでは支持されている。";
        case "partially_supported":
            return "Reviewの範囲修正を反映すれば支持されるが、未検証Evidenceが残る。";
        case "human_review_required":
            return "Evidenceが衝突しているため、現時点では判定できない。";
        case "conflicting":
            return "支持Evidenceと反証Evidenceが衝突しているため、現時点では判定できない。";
        case "insufficient_evidence":
            return "充足判定に必要なEvidenceが不足しているため、現時点では判定できない。";
        default:
            return "Requirement Clauseとして採用しない。";
    }
};

const factEvidence = (factId) => {
    const fact = factsById.get(factId);
    if (!fact) {
        throw new Error(`Unknown fact reference: ${factId}`);
    }
    return {
        factId: fact.factId,
        statement: fact.statement,
        sourceRole: fact.sourceRole,
        artifact: fact.source.artifact,
        revision: fact.source.revision,
        locator: fact.source.locator,
        contentHash: fact.source.contentHash
    };
};

const gapsFor = (review) => [
    ...review.scopeCorrections.map((description) => ({
        kind: "scope_correction",
        status: "applied_to_recommended_statement",
        description
    })),
    ...review.missingEvidence.map((description) => ({
        kind: "missing_evidence",
        status: "open",
        description
    })),
    ...review.requiredHumanDecisions.map((description) => ({
        kind: "human_decision",
        status: "open",
        description
    })),
    ...review.counterEvidence.map((evidence) => ({
        kind: "counter_evidence",
        status: "open",
        description: evidence.reason,
        artifact: evidence.artifact,
        revision: evidence.revision,
        locator: evidence.locator
    }))
];

const requirementClauses = approvedIds.map((clauseId) => {
    const candidate = candidatesById.get(clauseId);
    const review = reviewsById.get(clauseId);
    if (!candidate || !review) {
        throw new Error(`Unknown approved clause: ${clauseId}`);
    }
    return {
        clauseId,
        statement: review.recommendedStatement ?? candidate.statement,
        sourceCandidateStatement: candidate.statement,
        kind: candidate.kind,
        knowledgeType: review.recommendedKnowledgeType ?? candidate.knowledgeType,
        normativeStatus: "candidate",
        condition: candidate.structure,
        assessment: {
            result: assessmentResult(review.reviewState),
            answer: assessmentAnswer(review.reviewState),
            reviewState: review.reviewState,
            confidence: review.confidence
        },
        evidence: {
            supportingFactRefs: candidate.supportingFactRefs,
            supportingFacts: candidate.supportingFactRefs.map(factEvidence),
            refutingFactRefs: candidate.refutingFactRefs,
            refutingFacts: candidate.refutingFactRefs.map(factEvidence),
            reviewSupportingEvidence: review.supportingEvidence,
            reviewCounterEvidence: review.counterEvidence
        },
        gaps: gapsFor(review),
        alternativeExplanations: review.alternativeExplanations,
        ambiguities: candidate.ambiguities,
        openQuestions: candidate.openQuestions,
        possibleImplementationArtifacts: candidate.possibleImplementationArtifacts
    };
});

const excludedCandidates = rejectedIds.map((clauseId) => {
    const candidate = candidatesById.get(clauseId);
    const review = reviewsById.get(clauseId);
    if (!candidate || !review) {
        throw new Error(`Unknown rejected clause: ${clauseId}`);
    }
    return {
        clauseId,
        statement: candidate.statement,
        reviewState: review.reviewState,
        reason:
            review.recommendedStatement === null
                ? "CandidateはRequirementではなく実装詳細と判定された。"
                : review.recommendedStatement,
        gaps: gapsFor(review)
    };
});

const output = {
    schemaVersion: "1.0",
    featureSlice: factsDocument.featureSlice,
    definition:
        "この条件は満たされているか、どのEvidenceがそれを示すか、満たされていないなら何がGapかを個別に答えられる最小の要求単位。",
    interpretation: {
        baselineAssessment:
            "assessment.resultは指定BaselineのArtifactに対する評価であり、将来のRevisionや未確認Environmentには自動適用しない。",
        normativeStatus:
            "全Clauseは既存Artifactから復元したcandidateであり、人の承認を得るまで正式Requirementではない。",
        gapMeaning: "gapsは範囲修正、未検証Evidence、反証Evidence、人が決める必要のある事項を表す。"
    },
    generatedFrom: {
        facts: `agents/output/${factsFileName}`,
        candidateClauses: `agents/output/${candidatesFileName}`,
        independentReviews: `agents/output/${reviewsFileName}`
    },
    requirementClauses,
    excludedCandidates
};

for (const clause of output.requirementClauses) {
    for (const evidence of [
        ...clause.evidence.supportingFacts,
        ...clause.evidence.refutingFacts,
        ...clause.evidence.reviewSupportingEvidence,
        ...clause.evidence.reviewCounterEvidence
    ]) {
        if (/^https?:\/\//u.test(evidence.artifact)) {
            continue;
        }
        const artifactPath = path.resolve(agentsDir, "..", evidence.artifact);
        if (!fs.existsSync(artifactPath)) {
            throw new Error(`Evidence artifact does not exist for ${clause.clauseId}: ${evidence.artifact}`);
        }
    }
}

const prettierOptions = (await resolveConfig(destinationPath)) ?? {};
const formattedOutput = await format(JSON.stringify(output), {
    ...prettierOptions,
    filepath: destinationPath
});
fs.writeFileSync(destinationPath, formattedOutput);
console.log(
    JSON.stringify({
        destination: path.relative(path.resolve(agentsDir, ".."), destinationPath),
        requirementClauses: requirementClauses.length,
        excludedCandidates: excludedCandidates.length
    })
);
