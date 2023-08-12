import { parentPort, threadId, isMainThread, workerData } from "worker_threads";
import { Config } from "../DEPRECATED/config";
import { TextLintEngine } from "../DEPRECATED/textlint-engine";
import { TextFixEngine } from "../DEPRECATED/textfix-engine";
import type { TextlintFixResult, TextlintResult } from "@textlint/types";
import debug0 from "debug";
const debug = debug0("textlint:parallel/lint-worker");

export interface LintWorkerData {
    files: string[];
    config: Config;
    type: "lint" | "fix";
}

export type LintWorkerResults<type extends LintWorkerData["type"]> = type extends "lint"
    ? TextlintResult[]
    : TextlintFixResult[];
const { config, type, files } = workerData as LintWorkerData;
debug("Worker(%s) Start", threadId);

// Worker Main
if (isMainThread) {
    throw new Error("Worker should not be worked in mainThread");
}
const engine = type === "lint" ? new TextLintEngine(config) : new TextFixEngine(config);
engine
    .executeOnFiles(files)
    .then((results) => {
        debug("Worker(%s) Done", threadId);
        if (parentPort) {
            parentPort.postMessage(results);
        }
    })
    .catch((error) => {
        debug("Worker(%s) Error", error.stack);
        process.exitCode = 1;
    });
