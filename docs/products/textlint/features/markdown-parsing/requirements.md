# Markdown parsing

[日本語](requirements.ja.md)

## About this document

Markdown parsing converts Markdown text into TxtAST so that rules can check the prose and report accurate positions.
Markdown has a specification, so its syntax is parsed into nodes; the natural language inside stays as text for rules to handle.
It is provided by `@textlint/markdown-to-ast` and used by the built-in `@textlint/textlint-plugin-markdown`.
The parent Product is [textlint](../../product.md).

This document defines which Markdown syntax becomes which node, and the properties and positions of each node.
What every TxtAST satisfies, such as the common properties and the position conventions, is defined in [TxtAST](../txtast/requirements.md).

### Scope

- The `parse(text)` function
- The specifications that decide how Markdown is recognized
- The node that each syntax becomes, with its properties and its range
- Syntax that textlint defines because no specification covers it: front matter, footnotes, and inline notes
- Limits that keep parsing safe for untrusted documents

### Out of scope

- Plain text parsing and other formats provided by plugins
- Splitting prose into sentences or words. Rules do this, for example with a sentence splitter or a morphological analyzer
- Rendering Markdown to HTML, or writing Markdown back from an AST
- The properties and conventions shared by all formats. See [TxtAST](../txtast/requirements.md)

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

Scenario: When a paragraph has a soft line break, the lines stay in one `Str`

- Given: A paragraph of two lines `first` and `second` without trailing spaces
- When: The text is parsed
- Then: The paragraph has one `Str` whose `value` is `first\nsecond`, so a rule sees a sentence that continues over the line break

### Read Markdown as the specifications define it

As a writer, I want textlint to recognize my document the same way as the Markdown specifications so that the structure rules see is the structure that readers see on the rendered page.

**Acceptance criteria:**

Scenario: When the input is an example of the CommonMark specification, the structure is the one that the specification gives

- Given: An example of CommonMark 0.31.2, such as `> a` followed by the line `<a>`
- When: The text is parsed
- Then: The AST has the structure of the example's HTML: one `BlockQuote` whose `Paragraph` contains `a`, a line break, and the `Html` node `<a>`

Scenario: When the input is a GFM task list item, the marker belongs to the item

- Given: A list item `- [x] **done** task`
- When: The text is parsed
- Then: The `ListItem` has `checked: true` and its `raw` includes `[x]`. The `Paragraph` starts at `**done**`, and no node below the paragraph contains `[x]`

Scenario: When emphasis and strikethrough cross, the pair that closes first is recognized

- Given: A paragraph `*a ~~b* c~~`
- When: The text is parsed
- Then: The paragraph has `Emphasis` for `*a ~~b*` and a `Str` for ` c~~`, and has no `Delete`

### Report the right position

As a rule author, I want every node to point to the exact source text so that errors and fixes land on the right characters.

**Acceptance criteria:**

Scenario: When any node is produced, it follows the position conventions of TxtAST

- Given: Any Markdown text, including text with `\r\n` or `\r` line endings
- When: The text is parsed
- Then: For every node, `raw` equals `text.slice(range[0], range[1])`, `loc` describes the same span as `range`, each child is inside its parent, and siblings do not overlap

Scenario: When the text starts with a BOM, positions ignore it

- Given: Text that starts with U+FEFF
- When: The text is parsed
- Then: `range`, `loc`, and `raw` are the same as for the text without the BOM

Scenario: When a block is inside a container, its range excludes the container markers

- Given: A block quote `> a` whose second line is `> b`
- When: The text is parsed
- Then: The `BlockQuote` range covers both lines from the first `>`, and the `Paragraph` range starts at `a` and ends after `b`. The `>` of the second line is inside the paragraph's `raw` but not in the `value` of its `Str`

### Keep existing rules working

As a rule author, I want the node types and shapes to stay stable so that my published rules keep working after textlint updates its parser.

**Acceptance criteria:**

Scenario: When a document uses common Markdown, the node types are the generic nodes of TxtAST

- Given: A document with headings, lists, block quotes, code blocks, emphasis, links, and images
- When: The text is parsed
- Then: The node types are generic nodes (`Header`, `List`, `ListItem`, `BlockQuote`, `CodeBlock`, `Emphasis`, `Strong`, `Link`, `Image`, and so on)

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

### Check documents from untrusted contributors

As a writer who runs textlint in CI, I want a crafted document to be parsed in a time proportional to its size so that a pull request cannot stall the check.

**Acceptance criteria:**

Scenario: When a document repeats syntax that never closes, parsing time grows in proportion to the size

- Given: A document that repeats an opening such as `[a](b (`, `<!--`, or a run of backticks, without the closing part
- When: The document is made four times longer and parsed
- Then: Parsing takes about four times longer, not sixteen times

Scenario: When a document nests deeper than the limit, the markers beyond the limit stay as text

- Given: A line with 200 `>` markers followed by text
- When: The text is parsed
- Then: `parse` returns an AST without throwing, the AST has 100 nested `BlockQuote` nodes, and the remaining `>` markers are in the `Str` of the innermost paragraph

## KPIs

### Conformance to the specifications

- **Target value:** Every example of CommonMark 0.31.2 and of the GFM extensions is parsed into the structure that its HTML shows.
- **Measurement method:** Parse the examples of both specifications and compare the structure of the AST with the expected output.
- **Measurement period:** When the parser changes, and when a new version of a specification is adopted.

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

**Output:** A `Document` node that follows [TxtAST](../txtast/requirements.md).

#### Applicable conditions

##### Specifications

The parser follows these specifications, in this order.

1. [CommonMark 0.31.2](https://spec.commonmark.org/0.31.2/) decides everything that it defines.
2. [GitHub Flavored Markdown 0.29-gfm](https://github.github.com/gfm/) decides the extensions that it defines: [tables](https://github.github.com/gfm/#tables-extension-), [task list items](https://github.github.com/gfm/#task-list-items-extension-), [strikethrough](https://github.github.com/gfm/#strikethrough-extension-), and [autolinks](https://github.github.com/gfm/#autolinks-extension-).
3. This document decides what neither specification defines: the AST itself, the positions of nodes, front matter, footnotes, and inline notes.

The specifications define how text is recognized and rendered to HTML, not an AST.
The AST therefore has the same structure as the HTML of the specification, and this document decides only the node types, properties, and ranges.
When a specification leaves a case open, this document states the behavior.

The [disallowed raw HTML extension](https://github.github.com/gfm/#disallowed-raw-html-extension-) of GFM changes only the HTML output, so it does not apply.

##### Line endings and characters

- A line ends with `\n`, `\r\n`, or `\r` ([line ending](https://spec.commonmark.org/0.31.2/#line-ending)). `loc` counts lines by these line endings.
- A BOM at the start of the text is removed before parsing. Offsets do not count it, and `raw` of `Document` does not include it.
- U+0000 is replaced with U+FFFD in `value` and other properties ([insecure characters](https://spec.commonmark.org/0.31.2/#insecure-characters)). `raw` keeps the original character.
- A tab is not replaced. It stays in `raw` and `value` as a tab ([tabs](https://spec.commonmark.org/0.31.2/#tabs)).

##### Values of text

- In `value` of `Str`, backslash escapes and character references are decoded ([backslash escapes](https://spec.commonmark.org/0.31.2/#backslash-escapes), [character references](https://spec.commonmark.org/0.31.2/#entity-and-numeric-character-references)). `raw` keeps them as written.
- A [soft line break](https://spec.commonmark.org/0.31.2/#soft-line-breaks) is not a node. It stays in `Str`, and its `value` has the line ending as written. Spaces before the line ending, and the indentation and container markers of the next line, are not in `value`.
- `url`, `title`, `alt`, `lang`, and `meta` are decoded in the same way. A `title` that spans lines keeps the spaces before its line endings.

### Blocks

**Overview:** Each block structure of CommonMark and GFM becomes one node.

**Input:** A block structure in the text.

**Output:** The node of the table below.

#### Applicable conditions

##### Leaf blocks

| Syntax | Node | Properties | Range |
| --- | --- | --- | --- |
| [Thematic break](https://spec.commonmark.org/0.31.2/#thematic-breaks) | `HorizontalRule` | | From the first marker character to the end of the line |
| [ATX heading](https://spec.commonmark.org/0.31.2/#atx-headings) | `Header` | `depth`: number of `#` | From the first `#` to the end of the line |
| [Setext heading](https://spec.commonmark.org/0.31.2/#setext-headings) | `Header` | `depth`: 1 for `=`, 2 for `-` | From the content to the end of the underline's line |
| [Indented code block](https://spec.commonmark.org/0.31.2/#indented-code-blocks) | `CodeBlock` | `value`: the code without the indentation. `lang` and `meta` are `null` | From the indentation of the first line to the end of the last line |
| [Fenced code block](https://spec.commonmark.org/0.31.2/#fenced-code-blocks) | `CodeBlock` | `value`: the code between the fences. `lang`: the first word of the info string, or `null`. `meta`: the rest of the info string, or `null` | From the opening fence to the end of the closing fence's line |
| [HTML block](https://spec.commonmark.org/0.31.2/#html-blocks) | `Html` | `value`: the lines of the block as written | From the start of the first line, including its indentation, to the end of the last line |
| [Link reference definition](https://spec.commonmark.org/0.31.2/#link-reference-definitions) | `Definition` | `identifier`, `label`, `url`, and `title` or `null` | From `[` to the end of the last line |
| [Paragraph](https://spec.commonmark.org/0.31.2/#paragraphs) | `Paragraph` | | From the first character of the content to the end of the last line |
| [Table](https://github.github.com/gfm/#tables-extension-) | `Table` | `align`: one of `"left"`, `"right"`, `"center"`, or `null` for each column | From the header row to the end of the last row |

A comment `<!-- … -->` is an HTML block or raw HTML, so it is `Html`. The parser does not produce `Comment`.

The range of a leaf block does not include the indentation before its first line, except for indented code blocks and HTML blocks.
It ends at the end of its last line, so trailing spaces of that line are inside the range, and the line ending is not.

A blank line is not a node.

##### Tables

- The children of `Table` are `TableRow` nodes: the header row and the body rows. The delimiter row is not a node.
- The children of `TableRow` are `TableCell` nodes. A cell range includes its leading `|`, and the last cell also includes the trailing `|`.
- The children of `TableCell` are inline nodes, without the spaces around the content.
- When a paragraph of several lines is followed by a delimiter row, the last line of the paragraph is the header row, and the lines before it stay a paragraph. The GFM specification does not state this case.

##### Container blocks

| Syntax | Node | Properties | Range |
| --- | --- | --- | --- |
| [Block quote](https://spec.commonmark.org/0.31.2/#block-quotes) | `BlockQuote` | | From the first `>` to the end of the last child |
| [List](https://spec.commonmark.org/0.31.2/#lists) | `List` | `ordered`. `start`: the number of the first item, or `null` for a bullet list. `spread` | From the marker of the first item to the end of the last item |
| [List item](https://spec.commonmark.org/0.31.2/#list-items) | `ListItem` | `spread`. `checked`: `true`, `false`, or `null` | From the list marker to the end of the last child |

- A child block's range does not include the container markers and indentation before its first line. The markers at the start of its following lines are inside its range.
- `spread` of `ListItem` is `true` when blank lines separate its direct children. `spread` of `List` is `true` when blank lines separate its items.
- A list item that is empty, or an ordered list item whose number is not 1, does not interrupt a paragraph. After any other block, it starts a list.
- A complete HTML tag on its own line (start condition 7 of HTML blocks) does not interrupt a paragraph, including on a lazy continuation line of a block quote or list item.

##### Task list items

A [task list item](https://github.github.com/gfm/#task-list-items-extension-) is a `ListItem` whose first paragraph starts with `[ ]`, `[x]`, or `[X]` followed by whitespace.

- `checked` is `false` for `[ ]`, and `true` for `[x]` and `[X]`.
- The marker belongs to the `ListItem`: it is in `raw` of the `ListItem`.
- The `Paragraph` starts at the first character after the marker and the whitespace that follows it, whatever the first inline node is.
- No inline node contains the marker.

### Inlines

**Overview:** Each inline structure of CommonMark and GFM becomes one node, and the remaining text becomes `Str`.

**Input:** The content of a paragraph, heading, or table cell.

**Output:** The nodes of the table below, in source order.

#### Applicable conditions

##### Inline nodes

| Syntax | Node | Properties | Range |
| --- | --- | --- | --- |
| [Text](https://spec.commonmark.org/0.31.2/#textual-content) | `Str` | `value`: the decoded text | The text as written |
| [Code span](https://spec.commonmark.org/0.31.2/#code-spans) | `Code` | `value`: the code as written, with one space removed from each side when both sides have one | From the opening backticks to the closing backticks |
| [Emphasis](https://spec.commonmark.org/0.31.2/#emphasis-and-strong-emphasis) | `Emphasis` | | From the opening delimiter to the closing delimiter |
| [Strong emphasis](https://spec.commonmark.org/0.31.2/#emphasis-and-strong-emphasis) | `Strong` | | From the opening delimiter to the closing delimiter |
| [Strikethrough](https://github.github.com/gfm/#strikethrough-extension-) | `Delete` | | From the opening `~` or `~~` to the closing one |
| [Inline link](https://spec.commonmark.org/0.31.2/#links) | `Link` | `url`, and `title` or `null` | From `[` to `)` |
| [Reference link](https://spec.commonmark.org/0.31.2/#links) with a definition | `LinkReference` | `identifier`, `label`, `referenceType` | From `[` to the last `]` |
| [Inline image](https://spec.commonmark.org/0.31.2/#images) | `Image` | `url`, `alt`, and `title` or `null` | From `!` to `)` |
| [Reference image](https://spec.commonmark.org/0.31.2/#images) with a definition | `ImageReference` | `identifier`, `label`, `referenceType`, `alt` | From `!` to the last `]` |
| [Autolink](https://spec.commonmark.org/0.31.2/#autolinks) | `Link` | `url`: the URI, or `mailto:` and the address. `title` is `null` | From `<` to `>`. Its child `Str` is the text between them |
| [Autolink literal](https://github.github.com/gfm/#autolinks-extension-) | `Link` | `url`: the URL as written, with `http://` added for `www.` and `mailto:` added for an e-mail address. `title` is `null` | The URL or address. Its child `Str` has the same range |
| [Raw HTML](https://spec.commonmark.org/0.31.2/#raw-html) | `Html` | `value`: the tag | From `<` to `>` |
| [Hard line break](https://spec.commonmark.org/0.31.2/#hard-line-breaks) | `Break` | | The spaces or the backslash, and the line ending |

##### References

- A reference link or image without a matching definition is not a node. Its brackets stay in `Str`.
- `referenceType` is `"full"` for `[text][label]`, `"collapsed"` for `[label][]`, and `"shortcut"` for `[label]`.
- `Image` and `ImageReference` have no children. `alt` is the plain text of the description.

##### Emphasis and strikethrough

- `*`, `_`, and `~` delimiters are matched together in source order: each closing delimiter takes the nearest opening delimiter that it can match.
- A matched pair makes the delimiters between them plain text, so pairs never cross. `*a ~~b* c~~` is `Emphasis` followed by text.
- `~` matches only `~`, and `~~` matches only `~~`. A run of three or more `~` is text.

##### Raw HTML and autolinks

- Whitespace inside a tag is spaces, tabs, and line endings. Other Unicode spaces do not separate attributes, so such text stays `Str`.
- An autolink between `<` and `>` ends only at a space, `<`, `>`, or an ASCII control character.

### Syntax that textlint defines

**Overview:** Front matter, footnotes, and inline notes are not part of CommonMark or GFM. textlint defines them here, and their nodes are extension nodes with lowercase names.

**Input:** Front matter at the start of the text, or footnote syntax in the text.

**Output:** The extension nodes below.

#### Applicable conditions

##### Front matter

Front matter is recognized only at the first line of the text.

| Syntax | Node | Properties | Range |
| --- | --- | --- | --- |
| Lines between `---` and `---` | `yaml` | `value`: the lines between the fences | From the opening fence to the end of the closing fence |
| Lines between `+++` and `+++` | `toml` | `value`: the lines between the fences | From the opening fence to the end of the closing fence |
| Lines between `;;;` and `;;;`, or between `---json` and `---` | `json` | `value`: the lines between the fences | From the opening fence to the end of the closing fence |
| Lines from a first line `{` to a line `}` | `json` | `value`: the lines between the braces | From `{` to `}` |

`value` is the text as written. The parser does not parse YAML, TOML, or JSON.

##### Footnotes

| Syntax | Node | Properties | Range |
| --- | --- | --- | --- |
| `[^label]: text` at the start of a line | `footnoteDefinition` | `identifier`, `label`. Its children are blocks | From `[` to the end of the last child |
| `[^label]` with a matching definition | `footnoteReference` | `identifier`, `label` | From `[` to `]` |
| `^[text]` | `footnote` | Its children are inline nodes | From `^` to `]` |

- A label may contain spaces. `identifier` is the normalized form of `label`, as for link references.
- After `[^label]:`, one whitespace character is skipped. Lines indented by four spaces continue the definition.
- `[^` never starts a link or a link reference definition.
- `[^label]` without a matching definition stays in `Str`.
- In an inline note, a `]` closes the nearest open note when it does not close a link.

#### Exceptional behavior

##### Unclosed front matter

When the front matter fence is not closed, there is no front matter node, and the text is parsed as ordinary Markdown from the first line.
The failed fence has no effect on how the rest of the text is recognized.

##### Front matter that is not at the first line

Fences after the first line are ordinary Markdown. For example, `---` is a thematic break or a setext heading underline.

### Limits

**Overview:** The parser bounds the depth of the AST so that parsing and traversal are safe for any input.

**Input:** Text that nests containers or inline structures.

**Output:** An AST whose depth is bounded.

#### Applicable conditions

- Container blocks nest up to 100 levels below `Document`. `BlockQuote` and `footnoteDefinition` take one level each, and a list item takes two (`List` and `ListItem`).
- Inline nodes nest up to 100 levels inside a paragraph, heading, or table cell. `Emphasis`, `Strong`, `Delete`, `Link`, `LinkReference`, and `footnote` take one level each.
- The limit is deep enough that real-world documents do not reach it.

#### Exceptional behavior

##### Malformed Markdown

Markdown has no syntax errors. Unclosed or invalid syntax becomes text according to CommonMark, and `parse` does not throw.

##### Nesting beyond the limit

A marker that would open a container beyond the limit is handled as text of the current block.
A delimiter or bracket pair that would make an inline node deeper than the limit is not matched, and its markers stay in `Str`.
`parse` does not throw, and the inner structure within the limit is kept.

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
Parsing time must stay close to proportional to the input size, including for long tables, many unclosed brackets, repeated openings that never close, and deeply nested lists.
Parsing must not overflow the call stack, however deeply blocks or inline delimiters are nested, and `parse` returns an AST instead of throwing `RangeError: Maximum call stack size exceeded`.
The AST that `parse` returns is bounded in depth by the limits above, so textlint and rules can traverse it recursively.
Each `parse` call is independent: the result does not depend on the documents parsed before, and a failure in one call does not affect later calls.

## Open questions

- **Numeric target for parsing speed:** The target is relative to the previous release, and there is no absolute value such as MB/s. Until there is one, a change is accepted when it is not slower on the corpus. Revisit when users report that parsing is too slow for their documents. azu decides.
- **CJK-friendly emphasis:** An opt-in option to recognize emphasis and strikethrough next to CJK punctuation is proposed in textlint/textlint#2113. Whether it becomes part of this feature is not decided. Until it is, emphasis follows CommonMark. Revisit when #2113 is ready for review. azu decides with the PR author.
- **Table header taken from a paragraph of several lines:** The GFM specification does not state whether the last line of a paragraph can become a header row when that line would start another block by itself, such as a line with only `<a>`. Until this is confirmed against GitHub's implementation, the last line is the header row, as stated under Tables. Revisit when the result of cmark-gfm for this input is known. azu decides.
- **End of a block at the end of its container:** For an unclosed fenced code block, and for trailing lines that have only container markers or spaces, neither specification defines where the node ends. Until a rule is decided, the end positions fixed by the test fixtures apply. Revisit when a rule author reports a position that is wrong for a fix. azu decides.
