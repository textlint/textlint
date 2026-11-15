# Markdown parsing design

[日本語](design.ja.md)

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
textlint only needs the parsing part of a Markdown processor, so the package does not depend on a general-purpose framework such as unified/remark, and it does not build an intermediate AST such as mdast.

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

## Architecture and sequence diagrams

No diagram is needed. `parse()` calls the three phases in order, and none of them calls out to other modules except the entity table.

## Data model and ER diagrams

The output is the `TxtNode` tree defined in `@textlint/ast-node-types`, with the node types listed in the [Requirements](requirements.md#node-types).

The internal node pool is not exposed. It holds, per node, the kind, the start and end offsets, the parent, first child, last child, previous sibling, and next sibling indexes, and payload slots whose meaning depends on the kind (for example the heading depth, the list start number, or an index into the side table).

## APIs and interfaces

`parse(text: string): TxtDocumentNode` is the only function, and `Syntax` re-exports `ASTNodeTypes`.

Nodes have only the properties of `TxtNode` and of their node type.
They do not have a hidden `position` property for unist compatibility, because rules use `range` and `loc`.

## External service integration

None. The package has no third-party runtime dependencies.
The parser uses only ECMAScript built-ins (typed arrays, strings, and regular expressions with Unicode property escapes) and no Node.js modules, so it runs in browsers as it is, as the [Requirements](requirements.md#parse-without-a-server) ask.
The named character reference table is generated from the [WHATWG entities.json](https://html.spec.whatwg.org/entities.json) by a script in the package and committed as source, so no data is fetched at run time.

## Data handling

None. The source text is not kept after `parse` returns, although the reused pool keeps its allocated capacity.

## Authentication and authorization notes

None. Parsing has no access control.

## Security considerations

The [security considerations of the Requirements](requirements.md#security-considerations) ask that a crafted document neither stalls parsing nor overflows the call stack.

Parsing time stays close to proportional to the input size because no phase backtracks over the input.
Inline parsing uses the CommonMark delimiter and bracket stack algorithms, which handle unclosed brackets and delimiters without rescanning them, and the block phase visits each line once per open container.

Nesting depth is decided by the document, so it is not bounded.
Processing whose depth follows the nesting of the document, such as walking containers, delimiter runs, and the node pool, keeps its state in explicit stacks instead of the JavaScript call stack.
Recursion is fine where its depth does not grow with the input.
No depth limit is applied, so a deeply nested document still gets its real structure.

If `parse` throws for any other reason, the next `parse()` call resets the pool, so a failure does not affect later documents.

## Deployment notes

A change to node types or node properties breaks rules that depend on them, so such a change is released only in a major version, with the changes listed in the release notes.

## Alternatives considered

### Keep remark

This keeps following the remark ecosystem and allows remark plugins such as `remark-cjk-friendly`.
remark is a general-purpose Markdown processor that also covers transformation and serialization, while textlint only uses its parser and converts the result into its own AST.
It was not chosen for three reasons.
It brings packages that textlint never uses, such as serialization.
Converting mdast to TxtAST needs position workarounds for nodes that mdast leaves without positions.
Some inputs, such as long tables and many unclosed brackets, take far longer than their size suggests, which conflicts with the security considerations.

### Use micromark and mdast-util-from-markdown directly

This drops the unified/remark layer and keeps micromark as the tokenizer ([#2187](https://github.com/textlint/textlint/pull/2187)).
It removes about half of the third-party packages and produces the same AST except for Pandoc-style inline notes, which need `remark-footnotes`.
It was not chosen because the micromark tokenizer, which takes most of the parsing time, and the conversion from mdast stay.

### Maintain an in-house parser (chosen)

The cost is that textlint maintains its own parser and follows future CommonMark and GFM changes by itself.
This is accepted because CommonMark and GFM are written specifications with official example suites, which make the behavior testable, and textlint has no syntax of its own to add beyond the extensions listed in the Requirements.

## Open questions

- **CJK-friendly emphasis:** textlint/textlint#2113 proposes an opt-in option that recognizes emphasis next to CJK punctuation. With this design it is implemented in the inline phase following the [markdown-cjk-friendly specification](https://github.com/tats-u/markdown-cjk-friendly), and `parse` takes an options argument. Until the Requirements decide it, `parse` has no options. azu decides with the PR author.
