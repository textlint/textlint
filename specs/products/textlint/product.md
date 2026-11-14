# textlint

## Overview

textlint is a pluggable linting tool for natural language.
It is similar to ESLint, but it checks prose instead of program code.
textlint does not contain any rules by itself.
Users install rules, presets, and filter rules, and textlint runs them over documents written in Markdown, plain text, and other formats supported by plugins.

## Background and problems

### Background

Writing guidelines differ between projects, languages, and teams.
A single fixed set of checks cannot cover them, so textlint provides the common machinery, and the checks themselves are distributed as separate packages.

### Problems to solve

- Writers want mechanical checks for their writing guidelines, such as terminology, sentence length, and spacing, without reviewing every line by hand.
- Rule authors want to write a check once and run it on any document format, without parsing each format by themselves.

## Target users

### Writers

- **Characteristics:** People who write documents, books, and websites in Markdown or plain text, often in Japanese or English.
- **Problems:** Reviewing writing guidelines by hand is slow and inconsistent.
- **Usage context:** They run textlint from the command line, in CI, or in an editor integration.

### Rule and plugin authors

- **Characteristics:** Developers who publish textlint rules, presets, filter rules, and plugins as npm packages.
- **Problems:** A rule must report the correct position in the original document, whatever the document format is.
- **Usage context:** They traverse TxtAST in a rule, or convert a new document format into TxtAST in a plugin.

## Value provided

### One rule for every format

- **Recipient:** Rule authors and writers
- **Offering:** Plugins convert each document format into a common TxtAST, so a rule works on Markdown, plain text, and other formats.
- **Reason:** Rules only depend on TxtAST, not on a specific parser.

## Key concepts

- **Rule:** A check that receives TxtAST nodes and reports errors, optionally with a fix.
- **Plugin:** A package that converts a document format into TxtAST. Markdown and plain text plugins are built in.
- **TxtAST:** The tree of `TxtNode`s that textlint passes to rules. Every node has `type`, `raw`, `range`, and `loc`. It is defined loosely in [TxtAST interface](../../../docs/txtnode.md) and `@textlint/ast-node-types`.
- **Formatter:** A package that prints lint results, such as `stylish` or `json`.

## Feature list

| Feature | Description | Specification |
| --- | --- | --- |
| Markdown parsing | Converts Markdown text into TxtAST for rules | [Requirements](features/markdown-parsing/requirements.md) |
| Plain text parsing | Converts plain text into TxtAST for rules | Not written |
| Linting and fixing | Runs rules and filter rules over documents and applies fixes | Not written |
| Configuration loading | Finds `.textlintrc` and loads rules, presets, filter rules, and plugins | Not written |
| Result output | Prints results with a formatter | Not written |
| MCP server | Exposes linting to AI agents through the Model Context Protocol | Not written |

## Definition of success

Not written yet. It will be defined when the first product-wide decision needs it.

## Development principles

- textlint only needs the parsing part of a document parser. A parser that brings a general-purpose processing framework is not needed.
- TxtAST is language-agnostic. Syntax that only exists in one format does not need to become part of TxtAST.

## SLA, SLI, and SLO

### SLA

None. textlint is an open source tool without service guarantees.

### SLI and SLO

None, for the same reason.

## Open questions

- **Formal TxtAST specification:** TxtAST is defined loosely today. Formalizing it, including which node types belong to TxtAST and which are format-specific, is a goal, but the scope and document are not decided. Until then, `docs/txtnode.md` and `@textlint/ast-node-types` are the reference. azu decides.
- **Node type naming:** TxtAST node types use PascalCase (`Str`, `Paragraph`), while some Markdown-only nodes pass through with lowercase names (`footnote`, `footnoteDefinition`). Whether to unify the casing, and how, is not decided. Until then, the current names are kept. azu decides when the TxtAST specification is written.
