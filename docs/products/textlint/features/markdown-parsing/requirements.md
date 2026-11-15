# Markdown parsing

[日本語](requirements.ja.md)

## About this document

Markdown parsing converts Markdown text into TxtAST so that rules can check the prose and report accurate positions.
Markdown has a specification, so its syntax is parsed into nodes; the natural language inside stays as text for rules to handle.
It is provided by `@textlint/markdown-to-ast` and used by the built-in `@textlint/textlint-plugin-markdown`.
The parent Product is [textlint](../../product.md).

### Scope

- The `parse(text)` function and the node types it produces
- Which Markdown syntax becomes a node, and which stays as text
- The position information (`range`, `loc`, `raw`) of every node
- Parsing speed and the dependencies needed for parsing

### Out of scope

- Plain text parsing and other formats provided by plugins
- Splitting prose into sentences or words. Rules do this, for example with a sentence splitter or a morphological analyzer
- Rendering Markdown to HTML, or writing Markdown back from an AST
- How rules use the AST, and the formal TxtAST specification (see the open questions of the [Product](../../product.md))

## User stories

### Check only the prose

As a writer, I want Markdown syntax to be recognized as syntax so that rules check my sentences and do not report false positives on markup.
Syntax that has a meaning, such as links, code, and front matter, becomes a node instead of staying in a string.

**Acceptance criteria:**

Scenario: When a sentence contains inline syntax, the syntax becomes nodes and the prose stays in `Str`

- Given: A paragraph `See [docs](https://example.com) and \`code\`.`
- When: The text is parsed
- Then: The paragraph has `Str`, `Link`, `Str`, `Code`, and `Str` children, and the URL is not part of any `Str`

Scenario: When a document starts with front matter, the front matter is one node

- Given: A document that starts with a YAML block fenced by `---`
- When: The text is parsed
- Then: The first child of `Document` is a `yaml` node whose `raw` is the whole fenced block, and no `Str` contains the YAML

Scenario: When the text is not valid Markdown syntax, it stays as text

- Given: A paragraph `a * b * c`
- When: The text is parsed
- Then: The paragraph contains only `Str`, and parsing does not throw

### Report the right position

As a rule author, I want every node to point to the exact source text so that errors and fixes land on the right characters.

**Acceptance criteria:**

Scenario: When any node is produced, its `raw` matches its `range`

- Given: Any Markdown text
- When: The text is parsed
- Then: For every node, `raw` equals `text.slice(range[0], range[1])`, and `loc` describes the same span as `range`

Scenario: When the text starts with a BOM, positions ignore it

- Given: Text that starts with U+FEFF
- When: The text is parsed
- Then: `range` and `loc` are the same as for the text without the BOM

Scenario: When nodes are nested, children stay inside the parent

- Given: Nested containers such as a list inside a block quote
- When: The text is parsed
- Then: Each child's `range` is inside its parent's `range`, and siblings do not overlap

### Keep existing rules working

As a rule author, I want the node types and shapes to stay stable so that my published rules keep working after textlint updates its parser.

**Acceptance criteria:**

Scenario: When a document uses common Markdown, the node types follow `@textlint/ast-node-types`

- Given: A document with headings, lists, block quotes, code blocks, emphasis, links, and images
- When: The text is parsed
- Then: The node types are the `ASTNodeTypes` names (`Header`, `List`, `ListItem`, `BlockQuote`, `CodeBlock`, `Emphasis`, `Strong`, `Link`, `Image`, and so on)

Scenario: When textlint is updated in a minor or patch version, the AST of a document does not change

- Given: A Markdown document and the AST that one textlint version produces for it
- When: The document is parsed by a later minor or patch version
- Then: The AST has the same node types, properties, and positions. A change to them appears only in a major version and is listed in its release notes

### Parse without a server

As an integrator, I want the parser to run in browsers so that a writer's text does not have to be sent to a server to be checked.

**Acceptance criteria:**

Scenario: When the parser is bundled for a browser, it needs no Node.js polyfills

- Given: `@textlint/markdown-to-ast` and its runtime dependencies, resolved with the `browser` conditions of their packages
- When: They are bundled for a browser
- Then: The bundle does not need a Node.js built-in module such as `node:fs` or `node:util`, and `parse` returns the same AST as in Node.js

## KPIs

### Parsing speed

- **Target value:** No slower than the previous release on the same corpus. Faster is preferred.
- **Measurement method:** Parse a corpus of real-world documents in a loop and compare medians between the previous release and the change.
- **Measurement period:** When the parser implementation changes.

### Dependencies

- **Target value:** Only packages needed for parsing are in the production dependency closure. Packages for other processing, such as Markdown serialization, are not needed.
- **Measurement method:** Count the production dependency closure from `pnpm-lock.yaml`.
- **Measurement period:** When dependencies of the package change.

## Functional requirements

### Parse Markdown into TxtAST

**Overview:** `parse(text)` returns a `Document` node that contains the whole text.

**Input:** A Markdown string. It may start with a BOM.

**Output:** A `TxtDocumentNode`. Every node has `type`, `raw`, `range`, and `loc`. Text nodes also have `value`.

#### Applicable conditions

##### Supported syntax

- CommonMark 0.31.2
- GFM: tables, strikethrough, task list items, autolink literals (`https://…`, `www.…`, and e-mail addresses become `Link`), and footnotes (`[^1]` and `[^1]: …`)
- Pandoc-style inline notes (`^[note]`)
- Front matter at the start of the document: YAML (`---`), TOML (`+++`), and JSON (`;;;`, `---json` … `---`, or `{` … `}`)

##### Node types

- Nodes that have a counterpart in `ASTNodeTypes` use that PascalCase name, including `Table`, `TableRow`, `TableCell`, `LinkReference`, `ImageReference`, and `Definition`.
- Markdown-only nodes that are not in `ASTNodeTypes` use lowercase names: `yaml`, `toml`, `json` (front matter), `footnoteReference`, `footnoteDefinition`, and `footnote` (inline notes). Neither front matter nor footnotes are part of CommonMark or the GFM specification.
- Raw HTML, both block and inline, is `Html`.

##### Positions

- `range` is a pair of offsets in the text without the BOM.
- `loc` lines start at 1, and columns start at 0.

#### Exceptional behavior

##### Malformed Markdown

Markdown has no syntax errors. Unclosed or invalid syntax becomes text according to CommonMark, and `parse` does not throw.

##### Unclosed front matter

When the front matter fence is not closed, the text is parsed as ordinary Markdown from the first line.

## Data requirements

### Required data

- **Source text:** The Markdown string given to `parse`. It is not stored after `parse` returns.

### Relationships

Each node except `Document` has exactly one parent, and the children of a node are in source order.

### Personal information

None. The parser does not collect or keep any data.

## External service dependencies

None. Parsing runs locally and does not use any network service.

## Security considerations

textlint runs on documents from untrusted contributors in CI, so a crafted or unusual document must not stall parsing.
Parsing time must stay close to proportional to the input size, including for long tables, many unclosed brackets, and deeply nested lists.
Parsing must not overflow the call stack, however deeply blocks or inline delimiters are nested, and `parse` returns an AST instead of throwing `RangeError: Maximum call stack size exceeded`.
Nesting deeper than a fixed limit is not parsed as structure: the deeper part stays as text in the innermost node within the limit. The limit is deep enough that real-world documents do not reach it, so only crafted or broken documents get an AST that differs from their written structure.

## Open questions

- **Numeric target for parsing speed:** The target is relative to the previous release, and there is no absolute value such as MB/s. Revisit when users report that parsing is too slow for their documents. azu decides.
- **CJK-friendly emphasis:** An opt-in option to recognize emphasis and strikethrough next to CJK punctuation is proposed in textlint/textlint#2113. Whether it becomes part of this feature is not decided. Until it is, emphasis follows CommonMark. Revisit when #2113 is ready for review. azu decides with the PR author.
