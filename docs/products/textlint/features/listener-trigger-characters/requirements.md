# Listener trigger characters

[日本語](requirements.ja.md)

## About this document

Listener trigger characters let a rule tell textlint which characters a node must have before a listener of the rule can report anything, so that textlint calls the listener only for those nodes.
Most checks of a rule start from a few characters: a rule about parentheses has nothing to do in a node without a parenthesis.
Without this feature, textlint calls every listener for every node of its type, and each rule finds out by itself that the node has nothing to check. On a large set of documents, almost all calls end that way.
With the trigger characters, textlint reads the text of a node once for all rules and skips the calls that can not report.
The parent Product is [textlint](../../product.md).

### Scope

- The declaration of the trigger characters of a listener by a rule or a filter rule
- Which listeners textlint calls for a node when listeners have trigger characters
- What textlint does with a wrong declaration
- The check of the declaration in `textlint-tester`
- The cost for rules without trigger characters

### Out of scope

- Deciding the trigger characters for a rule. The author of the rule knows what the rule looks at; textlint does not guess from the code of the rule.
- Conditions other than characters, such as a regular expression, a word, or the result of a morphological analysis. See the open questions.
- Skipping a whole file by its path or its format. `.textlintignore` and the plugins decide which files are linted.
- Linting files in parallel. It is a separate way to shorten a run and does not reduce the calls.

## User stories

### Call a listener only for the nodes that can have a problem

As an author of a rule, I want to declare the characters that my listener looks for so that textlint does not call it for the nodes without them.

**Acceptance criteria:**

Scenario: When a node has a trigger character, the listener is called

- Given: A rule declares `(` and `)` as the trigger characters of its `Str` listener, and a document has a `Str` node `a (b) c`.
- When: textlint lints the document.
- Then: The listener is called once with the node.

Scenario: When a node has no trigger character, the listener is not called and the other listeners are

- Given: The same rule and another rule without trigger characters are configured, and a document has a `Str` node `abc`.
- When: textlint lints the document.
- Then: The listener with the trigger characters is not called for the node. The `Str` listener of the other rule is called once with the node.

Scenario: When a listener has no trigger characters, it is called for every node of its type

- Given: A rule declares nothing.
- When: textlint lints a document.
- Then: Each listener of the rule is called for every node of its type, in the same order as the nodes of the document.

### Get the same messages in a shorter time

As a user who lints many documents, I want the rules that declare trigger characters to report the same messages as before in a shorter time.

**Acceptance criteria:**

Scenario: When rules declare correct trigger characters, the messages do not change

- Given: A preset whose rules declare trigger characters, and the same preset without the declarations.
- When: textlint lints the same documents with each.
- Then: The messages, their positions, their order, and the fixed texts of `--fix` are the same.

Scenario: When a rule with trigger characters runs on a textlint without this feature, it works as a rule without them

- Given: A rule declares trigger characters, and a version of textlint that does not have this feature.
- When: That textlint lints a document with the rule.
- Then: The run does not fail. Each listener of the rule is called for every node of its type, and the messages are the same as on a textlint with this feature.

### Find a wrong declaration in the tests of the rule

As an author of a rule, I want the tests of my rule to fail when my trigger characters miss a node that the rule reports, so that a wrong declaration does not reach the users as missing messages.

**Acceptance criteria:**

Scenario: When the trigger characters hide a message, the test fails

- Given: A rule reports `！` in a `Str` node, declares only `!` as the trigger characters, and has a test case with the text `すごい！`.
- When: The author runs the test with `textlint-tester`.
- Then: The test case fails, and the failure says that the messages differ between the run with the trigger characters and the run that ignores them, with the id of the rule.

Scenario: When the messages are the same with and without the trigger characters, the test passes as before

- Given: A rule with correct trigger characters and its test cases.
- When: The author runs the tests with `textlint-tester`.
- Then: The result of each test case is the same as for the rule without the declaration.

### See the calls that were made

As a developer who looks at the performance of a run, I want the profile to count the calls that textlint made so that I can see the effect of the trigger characters.

**Acceptance criteria:**

Scenario: When a listener is skipped for a node, the profile does not count a call

- Given: A rule declares trigger characters, and half of the `Str` nodes of a document have none of them.
- When: The developer runs `textlint --profile`.
- Then: The number of the calls of the rule in the summary is the number of the nodes for which its listeners were called.

## KPIs

None. No metric is defined for this feature. [Change comparison](../change-comparison/requirements.md) measures the run time of a change.

## Functional requirements

### Declaration of trigger characters

**Overview:** A rule or a filter rule declares, for each listener, the characters that a node must have for the listener to be called.

**Input:** A listener with trigger characters: a string of one or more characters. Each character of the string is one trigger character.

**Output:** textlint calls the listener for a node only when the text of the node has at least one of the trigger characters.

#### Applicable conditions

##### The text of a node

The text of a node is its `raw`: the part of the document that the node covers.
textlint does not look at `value`, because a plugin can decode the text for `value` (for example, a character reference of Markdown), and the rule reports positions in the document.
The text of a parent node includes the text of its children, so the trigger characters of a `Paragraph` listener are looked for in the whole paragraph, and those of a `Document` listener in the whole document.

##### Comparing characters

A character is a Unicode code point. textlint compares code points as they are: it does not ignore case, and it does not normalize full-width and half-width forms or combining characters.
A rule that looks for both `!` and `！` declares both.

##### Which listeners

The declaration belongs to one listener. A rule can declare different trigger characters for each listener, and can leave some listeners without them.
It works the same way for every node type, for the listeners of the exit of a node (such as `Str:exit`), for rules and filter rules, and for `--fix`.
With `--fix`, textlint looks at the text that the listener is about to see, which earlier fixes can have changed.

##### The order of the calls

The trigger characters only remove calls. The listeners that are called for a node are called in the same order as without any declaration.

##### What the rule promises

A declaration is a promise of the rule: without a call for a node that has none of the trigger characters, the rule reports the same messages.
A rule that keeps a state between nodes, such as one that pairs an opening bracket with a closing bracket in a later node, declares every character that changes the state.
textlint does not check the promise during a lint; `textlint-tester` checks it for the test cases of the rule.

#### Exceptional behavior

##### The declaration is not a string of one or more characters

When the trigger characters of a listener are an empty string or not a string, the lint of the file fails with an error that has the id of the rule and the node type of the listener.
textlint does not treat it as "no trigger characters" or as "never call", because either would hide the mistake.

### Check of the declaration in `textlint-tester`

**Overview:** The tests of a rule find trigger characters that change the messages of the rule.

**Input:** The test cases of a rule that declares trigger characters, valid and invalid.

**Output:** A failure of the test case when the messages or the fixed text differ between a lint with the trigger characters and a lint that calls every listener for every node of its type.

#### Applicable conditions

The check runs for every test case of a rule that declares trigger characters and needs no option.
For a rule without trigger characters, `textlint-tester` lints each test case as many times as without this feature.

### Cost for rules without trigger characters

**Overview:** A run in which no listener has trigger characters costs the same as without this feature.

**Input:** A run with rules that declare nothing.

**Output:** None. It is a limit on the run time.

#### Applicable conditions

textlint looks at the text of a node only when a listener for that node has trigger characters.
It reads the text of a node once, however many listeners have trigger characters.
Without any declaration, the run has no performance loss from this feature that can be measured.

## Data requirements

### Required data

- **Trigger characters of a listener:** the characters that the rule declared. They live in memory during the lint.

### Relationships

Trigger characters belong to one listener of one rule.

### Personal information

None is collected.

## External service dependencies

None.

## Security considerations

The trigger characters are part of a rule, and a rule already runs any code. They add no new permission.
The error for a wrong declaration has the id of the rule and the node type, and no text of a document.

## Open questions

### Sets of characters that are too large to list

What is open: a way to declare a whole class of characters, such as all hiragana or all digits of every script, without listing them.
Interim treatment: a rule lists the characters, and a rule that looks at a class too large to list declares nothing.
Revisit condition: a rule that many users run can not use this feature only because of the size of its class.
Who decides: the maintainers of textlint.
