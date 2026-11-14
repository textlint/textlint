# textlint Development Guide

This file provides guidance for AI agents working on the textlint codebase.

textlint is a pluggable linter for natural language text.
It is a TypeScript monorepo managed with pnpm workspaces.
Read [CONTRIBUTING.md](docs/CONTRIBUTING.md) for setup, commit message format, and tests.

- Install and build: `pnpm install` and `pnpm run build`
- Test: `pnpm run test` (lint, project references, and package tests)
- Write code, comments, commit messages, issues, and pull requests in English

## Specification placement

`docs/` is the source of the published website (textlint.org).
Put specifications under `specs/products/` instead of `docs/products/`, using sdev's default layout below it.

<!-- sdev:begin -->
## Specifications-first development

Before creating or changing specifications, design, implementation, or verification, run `./bin/sdev help` and choose the guide for the task.
Tasks include defining product purpose, specifying feature requirements, designing an implementation, and updating documents.

Treat an idea such as 'I want to build this' as a starting point for discussing purpose and scope, rather than permission to implement.
When only a document is requested, present the document and its key points, then stop. When implementation is requested, present requirement and design decisions along the way.
Ask the user about unresolved decisions affecting purpose, scope, or observable behavior.
Ask instead of inventing purposes or constraints; prefer available question tools and follow up according to the answers.
Read `./bin/sdev help workflow` for the full workflow.

Prioritize the consuming project's instructions, conventions, and existing specifications.
If no template is designated for a new document, choose one from `./bin/sdev template`. Respect an existing document's structure when editing it.

Use this project's Product, Requirements, and Design. Without another placement rule, put specifications under `docs/products/`.
Use the default language and translations configured in sdev.toml. Default-language documents use `.md`; other language versions use `.<language>.md`.
Keep language versions equivalent and update them in the same change.
<!-- sdev:end -->
