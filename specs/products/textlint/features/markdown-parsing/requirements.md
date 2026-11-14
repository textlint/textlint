# Markdown parsing

## About this document

Markdown parsing converts Markdown text into TxtAST so that rules can check the prose and report accurate positions.
It is provided by `@textlint/markdown-to-ast` and used by the built-in `@textlint/textlint-plugin-markdown`.
The parent Product is [textlint](../../product.md).

### Scope

- The `parse(text)` function and the node types it produces
- Which Markdown syntax becomes a node, and which stays as text
- The position information (`range`, `loc`, `raw`) of every node
- Parsing speed and the dependencies needed for parsing

### Out of scope

- Plain text parsing and other formats provided by plugins
- Rendering Markdown to HTML, or writing Markdown back from an AST
- How rules use the AST, and the formal TxtAST specification (see the open questions of the [Product](../../product.md))

## User stories

### Check only the prose

As a writer, I want Markdown syntax to be recognized as syntax so that rules check my sentences and do not report errors on markup.

**Acceptance criteria:**

Scenario: When a sentence contains inline syntax, the syntax becomes nodes and the prose stays in `Str`

- Given: A paragraph `See [docs](https://example.com) and \`code\`.`
- When: The text is parsed
- Then: The paragraph has `Str`, `Link`, `Str`, `Code`, and `Str` children, and the URL is not part of any `Str`

Scenario: When a document starts with front matter, the front matter is one node

- Given: A document that starts with a YAML block fenced by `---`
- When: The text is parsed
- Then: The first child of `Document` is a `Yaml` node whose `raw` is the whole fenced block, and no `Str` contains the YAML

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

Scenario: When the parser implementation changes, the existing fixtures produce the same AST

- Given: The fixtures under `packages/@textlint/markdown-to-ast/test/fixtures`
- When: They are parsed by the new implementation
- Then: The output equals the committed `output.json`, unless the change is listed as a breaking change in the release notes

## KPIs

### Parsing speed

- **Current value:** About 0.8 MB/s on 3,189 real-world `.md` files (15.3 MB, 18,506 ms, median). About 657–686 ms for 330 KB of this repository's Markdown.
- **Target value:** No slower than the current value on the same corpus. Faster is preferred.
- **Measurement method:** Parse the same corpus in a loop with Node.js 22 and compare medians between the current and the new implementation.
- **Measurement period:** When the parser implementation changes.

### Dependencies

- **Current value:** 96 third-party packages (7.5 MB) in the production dependency closure of `@textlint/markdown-to-ast`, computed from `pnpm-lock.yaml`.
- **Target value:** Fewer than the current value. Packages that are only needed for processing other than parsing, such as Markdown serialization, are not needed.
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

- Nodes that have a counterpart in `ASTNodeTypes` use that name.
- Markdown-only nodes use their own names: `Table`, `TableRow`, `TableCell`, `Yaml`, `Toml`, `Json`, `LinkReference`, `ImageReference`, `Definition`, `FootnoteReference`, `footnoteDefinition`, and `footnote` (inline notes).
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

## Open questions

- **Numeric target for parsing speed:** The target is "no slower than the current value" for now. A numeric target can be set after the parser implementation is decided. azu decides.
- **Extremely deep nesting:** Thousands of nested block quotes or emphasis delimiters make `parse` throw `RangeError: Maximum call stack size exceeded`. Whether to return an AST for such input is not decided. Until then, the error reaches the caller. azu decides.
- **CJK-friendly emphasis:** An opt-in option to recognize emphasis and strikethrough next to CJK punctuation is proposed in textlint/textlint#2113. Whether it becomes part of this feature is not decided. Until then, emphasis follows CommonMark. azu decides with the PR author.
