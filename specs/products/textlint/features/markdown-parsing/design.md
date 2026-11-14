# Markdown parsing design

## About this document

This design explains how `@textlint/markdown-to-ast` meets the [Markdown parsing Requirements](requirements.md) of the [textlint Product](../../product.md).

### Audience

People and agents who change `@textlint/markdown-to-ast` or `@textlint/textlint-plugin-markdown`.

### Prerequisites

- [CommonMark 0.31.2](https://spec.commonmark.org/0.31.2/) and [GFM](https://github.github.com/gfm/) specifications
- The `TxtNode` interface in `@textlint/ast-node-types`

### Outside this document

How rules traverse TxtAST, and the plain text parser.

## Implementation approach

The package contains its own CommonMark + GFM parser that produces TxtAST directly.
textlint only needs the parsing part of a Markdown processor, so it does not depend on a general-purpose framework such as unified/remark, and it does not build an intermediate AST such as mdast.

Parsing runs in three phases over one source string.

1. **Block phase:** The parser scans the text line by line with the CommonMark container algorithm.
   It opens and closes block quotes, lists, and list items, and creates leaf blocks such as paragraphs, headings, code blocks, HTML blocks, tables, and front matter.
   A leaf block keeps its lines as segments (start and end offsets) instead of copying the text.
2. **Inline phase:** The parser parses the segments of paragraphs, headings, and table cells into inline nodes.
   Emphasis, strong, and strikethrough use the CommonMark delimiter stack; links and images use the bracket stack.
   Link reference definitions collected in the block phase resolve `LinkReference` and `ImageReference`.
3. **Emit phase:** The parser walks the node pool once and creates the `TxtNode` objects.
   `raw` and plain `value` strings are sliced from the source at this point, and `loc` is computed from a table of line start offsets.

The phases share one node pool.
The pool is a "struct of arrays": each node field (`kind`, `start`, `end`, `parent`, `firstChild`, `nextSibling`, and payload slots) is a typed array, and nodes refer to each other by index.
No node objects are created until the emit phase, and the pool is reused by the next `parse()` call.
Strings that need decoding, such as those with backslash escapes or character references, are stored in a side table.

A BOM is removed before parsing, and positions are counted without it.

### Why an in-house parser

The previous implementation used `remark-parse` (micromark) with `remark-gfm`, `remark-frontmatter`, and `remark-footnotes`, and converted mdast to TxtAST.
It was replaced for these reasons.

- textlint only needs parsing, but the remark stack brought about 96 third-party packages, including serialization packages that textlint never uses.
- Most of the parsing time was spent in micromark's tokenizer and in the conversion walk, and some inputs took tens of seconds (see [Security considerations](#security-considerations)).
- Position workarounds were needed for nodes without positions, and two position defects came from the micromark/mdast layer.
- CommonMark is a stable written specification with an official example suite, so following it is maintainable without a third-party parser.

This also returns to where textlint started.
The first version of textlint (December 2014) was built on the AST of the `commonmark` package, because CommonMark was the only parser that kept node positions at that time; remark did not have positions yet.
textlint later moved to remark. There is no record of the reason for that move.

### Compatibility with the previous implementation

The output AST is the same as the previous implementation's for every input in these corpora, compared as whole ASTs including `range`, `loc`, and `raw`.

| Corpus | Identical |
| --- | --- |
| Fixtures of `@textlint/markdown-to-ast` | 227 / 227 |
| CommonMark 0.31.2 spec examples | 652 / 652 |
| GFM spec examples and extension tests | 702 / 702 |
| Real-world `.md` files | 2,852 / 2,852 |
| Markdown files of this repository | 403 / 403 |

Random inputs made of Markdown tokens differ in about 0.2–0.8% of cases, depending on the token set.
When the top-level block structure differs, the new parser matches cmark-gfm, GitHub's reference implementation, in most cases, and the previous implementation rarely does.
The differences fall into these groups.

- **Unclosed front matter fence:** The previous implementation stopped recognizing lists in the whole document when the first line looked like a front matter fence (for example `---` used as a thematic break). The new parser follows CommonMark.
- **Task list item followed by a line ending:** The previous implementation gave the following paragraph a `loc` that did not match its `range`. The new parser keeps them consistent.
- **Table header after a paragraph line indented with a tab:** The new parser starts a table, as cmark-gfm does. The previous implementation kept the lines in the paragraph.
- **Unclosed fenced code or HTML block at the end of a list item or block quote:** The previous implementation let a `ListItem` overlap the next item. The new parser ends it before the next item. Inside a block quote, the end of an unclosed code block can differ by the trailing `> ` marker.
- **Trailing whitespace inside nested containers with tabs:** A few `range` values differ. The cause is not fully understood.

The `raw === text.slice(range)` invariant, `loc`/`range` consistency, containment of children, and non-overlapping siblings hold for both implementations on all of these inputs, and are checked by `test/invariants.test.ts`.

## Architecture and sequence diagrams

No diagram is needed. `parse()` calls the three phases in order, and none of them calls out to other modules except the entity table.

## Data model and ER diagrams

The output is the `TxtNode` tree defined in `@textlint/ast-node-types`, with the node types listed in the [Requirements](requirements.md#node-types).

The internal node pool is not exposed. It holds, per node, the kind, the start and end offsets, the parent, first child, last child, previous sibling, and next sibling indexes, and payload slots whose meaning depends on the kind (for example the heading depth, the list start number, or an index into the side table).

## APIs and interfaces

`parse(text: string): TxtDocumentNode` is the only function, and `Syntax` re-exports `ASTNodeTypes`.
These are the same as in the previous implementation.

Nodes no longer have the hidden, non-enumerable `position` property that the previous implementation kept for unist compatibility.
Rules use `range` and `loc`; no use of `position` was found in the `textlint`, `textlint-ja`, and `textlint-rule` organizations.

## External service integration

None. The package has no third-party runtime dependencies.
The parser uses only ECMAScript built-ins (typed arrays, strings, and regular expressions with Unicode property escapes) and no Node.js modules, so it runs in browsers as it is, as the [Requirements](requirements.md#parse-without-a-server) ask.
The named character reference table is generated from the [WHATWG entities.json](https://html.spec.whatwg.org/entities.json) by `tools/generate-entities.mjs` and committed as source.

## Data handling

None. The source text is not kept after `parse` returns, although the reused pool keeps its allocated capacity.

## Authentication and authorization notes

None. Parsing has no access control.

## Security considerations

Inline parsing uses the CommonMark delimiter and bracket stack algorithms, which avoid the backtracking that makes naive parsers slow on unclosed brackets and delimiters.
Measured with Node.js 22 against the previous implementation:

| Input | Previous | New |
| --- | --- | --- |
| A table with 20,000 rows | about 25 s | about 40 ms |
| 20,000 `[` followed by 20,000 `]` | about 24 s | about 12 ms |
| 20,000 `[a](` | about 11 s | about 33 ms |
| 1,000 nested lists | about 24 s | about 0.9 s |

Nested lists still grow faster than linear with the nesting depth.
Thousands of nested block quotes or emphasis delimiters overflow the call stack in both implementations (see the open questions of the [Requirements](requirements.md#open-questions)).
A parse that throws leaves the pool in a state that the next `parse()` call resets.

## Deployment notes

The change is released in a major version, together with the other Markdown AST changes of that version.
Release notes list the removal of the hidden `position` property and the [compatibility differences](#compatibility-with-the-previous-implementation).

## Alternatives considered

### Keep remark

This keeps following the remark ecosystem and allows remark plugins such as `remark-cjk-friendly`.
remark is a general-purpose Markdown processor that also covers transformation and serialization, while textlint only uses its parser and converts the result into its own AST.
It was not chosen because it keeps the dependencies, the position workarounds, and the slow cases described above.

### Use micromark and mdast-util-from-markdown directly

This drops the unified/remark layer, walks only `children` when converting mdast, and keeps micromark as the tokenizer.
It reduces third-party packages from 134 to 65 (fresh npm install) and parsing time by about 18% (686 ms to 561 ms for 330 KB), with the same AST except Pandoc-style inline notes, which need `remark-footnotes`.
It was not chosen because the micromark tokenizer, which is most of the remaining time, and its position defects stay, while the in-house parser parses the same 330 KB in about 10 ms.

### Maintain an in-house parser (chosen)

The cost is about 3,500 lines of parser code that textlint maintains, and following future CommonMark and GFM changes is textlint's job.
This is accepted because the specifications and their example suites make the behavior testable, and textlint has no syntax of its own to add beyond the listed extensions.

## Open questions

- **CJK-friendly emphasis:** textlint/textlint#2113 proposes an opt-in option that uses `remark-cjk-friendly`. With this design it needs to be implemented in the inline phase following the [markdown-cjk-friendly specification](https://github.com/tats-u/markdown-cjk-friendly), and `parse` needs an options argument. The Requirements decision comes first. azu decides with the PR author.
- **Tab-related range differences:** The cause of the few `range` differences with trailing whitespace in nested containers with tabs is not understood. Until it is, they are treated as known differences. Investigate when a user reports a wrong position in such a document.
