# textlint

## Overview

textlint is a pluggable linting tool for natural language.
It is similar to ESLint, but it checks prose instead of program code.
textlint parses the markup of a document, such as Markdown, because markup has a specification.
It does not parse the natural language inside the markup; rules handle the language.
This makes textlint a tool that is smarter than a text search (grep) but does not try to understand language like a human.

textlint does not contain any rules by itself.
Users install rules, presets, and filter rules, and textlint runs them over documents written in Markdown, plain text, and other formats supported by plugins.

## Background and problems

### Background

Writing guidelines differ between projects, languages, document types, and readers.
A novel, a technical book, and a translation need different rules, and even one writer writes differently for a blog and for a book.
Natural language also changes over time: new words appear every day, usage that was once an error becomes accepted, and the meaning of a word can shift.
So there cannot be one official set of rules, and an AST that covers the grammar of every natural language cannot be built.
textlint therefore provides the common machinery, and the checks themselves are distributed as separate packages.

### Problems to solve

- Writers want mechanical checks for their writing guidelines, such as terminology, sentence length, and spacing, without reviewing every line by hand, and they want to run the checks in CI.
- Checking documents as plain strings produces false positives on markup: a code span, a URL, or a quotation should not be checked like a sentence, and even "the number of characters" differs between Markdown and plain text.
- Rule authors want to write a check once and run it on any document format, without parsing each format by themselves.

## Target users

### Writers

- **Characteristics:** People who write documents, books, translations, novels, and websites in Markdown or plain text, often in Japanese or English. Teams also use textlint to keep the wording of their products consistent.
- **Problems:** Reviewing writing guidelines by hand is slow and inconsistent.
- **Usage context:** They run textlint from the command line, in CI, or in an editor integration.

### Rule and plugin authors

- **Characteristics:** Developers who publish textlint rules, presets, filter rules, and plugins as npm packages.
- **Problems:** A rule must report the correct position in the original document, whatever the document format is.
- **Usage context:** They traverse TxtAST in a rule, or convert a new document format into TxtAST in a plugin.

### Integrators

- **Characteristics:** Developers who embed textlint in editors, browsers, bots, and other tools.
- **Problems:** They need to run textlint where the text is, sometimes without sending the text to a server.
- **Usage context:** They use textlint's packages as modules, including in browsers.

## Value provided

### One rule for every format

- **Recipient:** Rule authors and writers
- **Offering:** Plugins convert each document format into a common TxtAST, so a rule works on Markdown, plain text, and other formats.
- **Reason:** Rules only depend on TxtAST, not on a specific parser.

### Checks that stay on the writer's machine

- **Recipient:** Writers and integrators
- **Offering:** textlint and most rules run locally, and textlint can run in browsers, so the text does not have to be sent to an external service.
- **Reason:** Documents are often private until they are published.

## Key concepts

- **Rule:** A check that receives TxtAST nodes and reports errors, optionally with a fix.
- **Filter rule:** A rule that decides which reported errors to ignore, for example inside `<!-- textlint-disable -->` comments.
- **Preset:** A package that bundles rules for a purpose, such as technical writing.
- **Plugin:** A package that converts a document format into TxtAST. Markdown and plain text plugins are built in.
- **TxtAST:** The tree of `TxtNode`s that textlint passes to rules. Every node has `type`, `raw`, `range`, and `loc`. It describes the structure of the markup, and the prose stays in text nodes (`Str`). It is defined loosely in [TxtAST interface](../../../docs/txtnode.md) and `@textlint/ast-node-types`.
- **Message:** An error reported by a rule, with its location as a range in the source.
- **Formatter:** A package that prints messages, such as `stylish` or `json`.

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

- **Everything is pluggable.** The core does not depend on any markup language or natural language. A new markup language needs a plugin, a new check needs a rule, a new natural language is handled inside rules, and a new output needs a formatter. textlint itself only defines the AST and the message format.
- **No built-in rules.** Rules are opt-in, because a tool that reports too many false positives by default gets ignored, and CI cannot ask the user to dismiss them one by one. Rules live outside the core, in the `textlint-rule` organization for language-independent rules and `textlint-ja` for Japanese rules.
- **Parsers are close to the core.** Plugins decide how markup is understood, so the built-in parsers and the plugin community are maintained in the `textlint` organization.
- **Only the parsing part is needed.** textlint needs the parsing part of a document parser. A parser that brings a general-purpose processing framework is not needed.
- **TxtAST is language-agnostic.** Syntax that only exists in one format does not need to become part of TxtAST.
- **Runs in browsers.** Packages that the kernel loads, including parsers, avoid Node.js-only APIs so that textlint can run without a server.
- **Check with real documents.** Behavior is checked against real-world documents, such as books and documentation written with textlint, not only against hand-written test cases.
- **Build what is used.** Development moves forward with real use cases, such as writing books with textlint.

## SLA, SLI, and SLO

### SLA

None. textlint is an open source tool without service guarantees.

### SLI and SLO

None, for the same reason.

## Open questions

- **Formal TxtAST specification:** TxtAST is defined loosely today. Formalizing it, including which node types belong to TxtAST and which are format-specific, is a goal, but the scope and document are not decided. Until then, `docs/txtnode.md` and `@textlint/ast-node-types` are the reference. azu decides.
- **Node type naming:** TxtAST node types use PascalCase (`Str`, `Paragraph`), while some Markdown-only nodes pass through with lowercase names (`footnote`, `footnoteDefinition`). Whether to unify the casing, and how, is not decided. Until then, the current names are kept. azu decides when the TxtAST specification is written.
