---
name: performance-check
description: Measure the performance effect of a change to textlint (a parser, the kernel, traversal, or other per-file or per-node code) with --profile and pnpm run compare, and report before/after in the pull request.
---

# Performance check for textlint

Use this when a change can affect the speed of textlint: a parser (`@textlint/markdown-to-ast`, `@textlint/text-to-ast`, the plugins), the kernel (`@textlint/kernel`: traversal, rule dispatch, messages, fixes), `@textlint/ast-traverse`, the CLI, or a dependency of them.
Also use it when the user asks whether something is faster or slower, or asks to optimize.

The specifications are `docs/products/textlint/features/performance-profile/` (`--profile`) and `docs/products/textlint/features/change-comparison/` (`pnpm run compare` and the CI job).

## 1. Find where the time goes

Build first (`pnpm run build`, or `pnpm --filter "./packages/**" run build`), then profile one run:

```sh
cd test/benchmark
node ../../packages/textlint/bin/textlint.js --profile --config .textlintrc.jtf-style.json --rules-base-directory node_modules examples
```

`--profile` prints Markdown with the phases (startup, load-config, search-files, lint with parse / traverse / rules / filter-rules / post-process, format), the parse time of each plugin, the top rules, and the slowest files. `--format json` prints all rules as JSON.
The phases under lint are sums over files, and rules run one after another while profiling, so use the profile to decide where to look, not to claim a speedup.

For a function-level view, use the CPU profiles that `pnpm run compare` writes, or run `node --cpu-prof` yourself.

## 2. Compare with master

```sh
pnpm run compare --set small,medium      # quick check, a few minutes
pnpm run compare                         # all sets, before opening the pull request
pnpm run compare --base <ref> --no-build # another base, head already built
pnpm run compare --set huge --measure cli # only the CLI (lint results, profile, run time); in-process is the parsers and the traversal
```

Outputs are in `compare-result/`: `compare.md` (also printed), `compare.json`, and `cpuprofiles/<set>-<base|head>-<cli|parse|traverse>.cpuprofile`, which Chrome DevTools opens (Performance panel, "Load profile").

Read the output in this order:

1. **Lint results.** "Removed messages" and "Added messages" must be empty unless the change is meant to change what rules report. Explain every difference.
2. **Parsers** (`parse: @textlint/markdown-to-ast`, `parse: @textlint/text-to-ast`) and **traverse + dispatch with a no-op rule**: in-process medians, the most stable numbers. Marked at 1.1x slower / 0.91x faster.
3. **CLI run time**: what users see; noisy, marked at 1.3x / 0.77x.
4. **CPU profiles**: which package (✱ = this repository) and which functions moved between base and head.

## 3. Report

- Paste the Markdown output (or the relevant sets) into the pull request description, with the command you ran and the machine (CPU count, Node.js version).
- Do not call a change within the thresholds an improvement or a regression; say it is within noise.
- If the CI job "Profile and benchmark" ran, point to its job summary as well; it compares the base commit of the pull request and the head on all sets.
- When a change is slower on purpose (for correctness), say why in the description.

## Notes

- The sets are fixed: `small` is `test/benchmark/examples`, the others are downloaded at commits in `test/benchmark/compare-sets.json` into `~/.cache/textlint-compare`. Change a commit only in a pull request of its own.
- The rules of the comparison are `preset-jtf-style` (`test/benchmark/.textlintrc.jtf-style.json`), chosen so that textlint's own work is a large part of a run.
- `TIMING=1` still prints the time of each rule at exit; `--profile` covers it and more.
