---
title: Performance improvements in textlint and its rules
authors: azu
---

In the last two weeks, we improved the performance of textlint and of the rules and libraries that many textlint users install.
In our benchmarks, a lint that took 75.5 seconds now takes 7.2 seconds, and uses less than half of the memory.

Your configuration and your rules do not need to change.
Update textlint and your rules to get the improvements.

![The run time of the textlint CLI for each version of textlint from 15.8.0 to 16.1.3, with the rules of the release day of each version. preset-jtf-style on MDN Web Docs in Japanese: 75.5, 29.2, 8.7, 8.5, 7.4, and 7.2 seconds. preset-ja-technical-writing on js-primer: 40.6, 19.3, 18.9, 18.4, 4.3, and 4.1 seconds. preset-ja-technical-writing on web/javascript of MDN Web Docs in Japanese: 150, 95.8, 96.7, 93.5, 16.0, and 15.3 seconds.](./assets/2026-11-23-textlint-performance.png)

Each bar is the state of `npm install` on the release day of that version of textlint, from 15.8.0 on 2026-11-08 to 16.1.3 on 2026-11-23.
The rules and libraries are the versions of that day too.

- `preset-jtf-style` on the Japanese translation of MDN Web Docs (10,452 files): 75.5 s → 7.17 s, and the peak memory 1,022 MB → 475 MB.
- `preset-ja-technical-writing` on js-primer (105 files): 40.6 s → 4.10 s, and 905 MB → 290 MB.
- `preset-ja-technical-writing` on `web/javascript` of MDN Web Docs in Japanese (1,043 files): 149.9 s → 15.3 s, and 2,555 MB → 313 MB.

The values are the run time of the textlint CLI and the largest memory of the process (peak RSS).
[How we measured](#how-we-measured) describes the details.

This post describes why we worked on performance, how the numbers changed, what we changed, and how we keep textlint from getting slower.

## Why performance matters now

Speed was not a goal of textlint before.
textlint is a pluggable linter for natural language, and every rule is a package outside of textlint.
A rule may load a dictionary or analyze Japanese text into words, so the rules take most of the time of a run.
We chose this freedom of rules over speed.

Two things changed.

- **Documents are growing faster than before.** AI agents write documents as well as code, and more text is written in the life cycle of development: specifications, design documents, and guides.
- **A linter gives the same result for the same text.** People and AI agents run it after every edit, so the time of a lint is paid many times a day.

When the number of documents grows, a linter that takes a minute is not run after every edit.
So we now treat performance as a goal of textlint.

## What we kept

textlint has many rules that we do not maintain, and we can not change them.
So we set one condition for this work: **existing rules and configurations keep working, and they report the same results**.

- We did not change the rule API or TxtAST to make textlint faster.
- We made the existing work cheaper: textlint and the libraries did the same work many times, created objects that nobody used, and kept data longer than needed.
- For every change, we compared the lint results before and after on real documents.

The only steps you need are in [How to update](#how-to-update).
textlint v16 requires Node.js 22.12.0 or later, as the [v16.0.0 release post](https://textlint.org/blog/2026/11/15/textlint-16/) describes.

## How the numbers changed

Three sets of releases made most of the difference in the chart at the top.

- **2026-11-15: textlint 16.0.0 and sentence-splitter 5.1.0.** Both have a new parser. `jtf-style` on MDN went from 75.5 s to 29.2 s, and `ja-technical-writing` on js-primer went from 40.6 s to 19.3 s.
- **2026-11-16: `preset-jtf-style` 3.1.0, with match-index 1.0.4 and textlint-rule-helper 2.6.0.** `jtf-style` on MDN went from 29.2 s to 8.69 s.
- **2026-11-21: kuromojin 3.1.0 and textlint 16.1.2.** `ja-technical-writing` went from 18.4 s to 4.25 s on js-primer, and from 93.5 s to 16.0 s on MDN `web/javascript`. The peak memory went from 2,482 MB to 324 MB there, and from 955 MB to 475 MB for `jtf-style` on MDN, which does not use kuromojin.

### textlint and the rules both matter

Which update matters depends on the rules.
The following table updates only textlint, or only the rules.

| | `jtf-style`, MDN | `ja-technical-writing`, js-primer |
| --- | ---: | ---: |
| textlint 15.8.0 and the rules of 2026-11-08 | 75.5 s | 40.6 s |
| Only textlint is new (16.1.3) | 27.1 s | 35.4 s |
| Only the rules are new | 52.6 s | 6.13 s |
| Both are new | 7.17 s | 4.10 s |

- `preset-jtf-style` has 33 rules that check text with regular expressions. Each rule is cheap, so the time of textlint itself was a large part of the run.
- `preset-ja-technical-writing` analyzes Japanese text into words with [kuromojin](https://github.com/textlint/kuromojin). Almost all of the time was in the rules and their libraries.

So updating only textlint is not enough. Update your rules too.

## What we changed in textlint

We started with textlint itself.

Each number is the measurement in the pull request, with `preset-jtf-style` where rules are used.

### Parsing and calling rules (16.0.0)

- A new Markdown parser without third-party dependencies. Parsing js-primer went from 1,070 ms to 18 ms ([#2188](https://github.com/textlint/textlint/pull/2188)).
- Less work for each node when calling rules. A lint of 2,691 files with a rule that does nothing went from 696 ms to about 490 ms ([#2202](https://github.com/textlint/textlint/pull/2202)).

### Output and startup (16.1.1)

- The `stylish` formatter measures each cell once. Formatting 175,883 messages went from 4.7 s to 0.66 s ([#2214](https://github.com/textlint/textlint/pull/2214)).
- The MCP server is loaded only with `--mcp`. `textlint --version` went from 300 ms to about 150 ms ([#2219](https://github.com/textlint/textlint/pull/2219)).
- `read-package-up` is replaced with a small helper, so 21 fewer packages (about 3.4 MB) are installed ([#2218](https://github.com/textlint/textlint/pull/2218)).

### Memory (16.1.2)

- At most 8 files are in process at the same time, and a file is read when its turn comes. MDN went from 7.78 s to 6.67 s, and the peak memory from 980 MB to 713 MB ([#2222](https://github.com/textlint/textlint/pull/2222)).
- The AST of a file is released soon after the lint of the file. The pause of the minor GC on MDN went from about 470 ms to about 210 ms ([#2227](https://github.com/textlint/textlint/pull/2227)).

The second one was not about algorithms.
The cause was where V8 allocates a function: a function that is assigned to a property in a constructor was allocated in the old generation, and it kept the AST of each file alive until the next major GC.
We found it by measuring the garbage collection, not by reading the code.

### `--fix` (16.1.3)

- `--fix` parses a file again only after a fix. `--fix --dry-run` on MDN went from 33.2 s to 18.4 s ([#2233](https://github.com/textlint/textlint/pull/2233)).

## What we changed in rules and libraries

After the changes of textlint, the rules took most of the remaining time.
So we profiled the rules, and improved the libraries that many rules share.

### sentence-splitter 5.1.0

[sentence-splitter](https://github.com/textlint-rule/sentence-splitter) splits a paragraph into sentences.
Many rules use it, such as `sentence-length` and `max-ten`.

- The 5.0.x patch releases keep only the text of the node, instead of the whole file, for each paragraph ([#61](https://github.com/textlint-rule/sentence-splitter/pull/61)).
- 5.1.0 has a new parser that scans the text into flat typed arrays and creates the nodes once ([#70](https://github.com/textlint-rule/sentence-splitter/pull/70)).

`splitAST()` of 5.1.0 is about 25–29 times faster than 5.0.3, and about 1,300–1,600 times faster than 5.0.0 ([v5.1.0 release notes](https://github.com/textlint-rule/sentence-splitter/releases/tag/v5.1.0)).

### kuromojin 3.1.0

[kuromojin](https://github.com/textlint/kuromojin) analyzes Japanese text into words.
Many Japanese rules use it, and it took about 70% of a run with `preset-ja-technical-writing`.

kuromojin 3.1.0 has its own analyzer and its own dictionary file, instead of kuromoji.js.
The tokens are compatible with the ones of kuromoji.js.

Compared with 3.0.2, the [v3.1.0 release notes](https://github.com/textlint/kuromojin/releases/tag/v3.1.0) report the following.

- Load of the dictionary: 440 ms → 51 ms
- Analysis of each line of js-primer: 2,206 ms → 167 ms
- Memory after the load: 182 MB → 27.2 MB
- Installed size with dependencies: 47.7 MB → 5.10 MB

We did not start from the implementation.
First we wrote several prototypes to see how much could be removed, and set the goal to remove 80% of the time.
Then we wrote the requirements and the design of the analyzer, the dictionary format, and the [dictionary versions](https://github.com/textlint/kuromojin#dictionary-versions) as specifications, and implemented them.
The dictionary does not change within a major version, so the lint results do not change when words are added later.

### preset-jtf-style 3.1.0 and shared helpers

- [textlint-rule-preset-JTF-style 3.1.0](https://github.com/textlint-ja/textlint-rule-preset-JTF-style/releases/tag/v3.1.0) creates each regular expression once, skips a `Str` node that does not have the characters that a rule looks for, and no longer depends on `textlint-rule-prh`.
- [match-index 1.0.4](https://github.com/azu/match-index/pull/3) collects the matches only when the text has a match.
- [textlint-rule-helper 2.6.0](https://github.com/textlint/textlint-rule-helper/pull/33) and [textlint-util-to-string 3.3.5](https://github.com/textlint/textlint-util-to-string/pull/26) walk the AST less and allocate less.
- With these four updates, the MDN benchmark in the CI of textlint went from 36.0 s to 10.1 s, with the same 175,883 messages ([#2216](https://github.com/textlint/textlint/pull/2216)).
- [textlint-rule-preset-japanese 10.1.0](https://github.com/textlint-ja/textlint-rule-preset-japanese/releases/tag/v10.1.0) and [textlint-rule-preset-ja-technical-writing 12.1.0](https://github.com/textlint-ja/textlint-rule-preset-ja-technical-writing/releases/tag/v12.1.0) include these versions.

## Keeping textlint from getting slower

A fast release does not stay fast by itself.
The main policy from now on is to notice when textlint gets slower, more than to chase speed.

### `textlint --profile`

`--profile` prints where the time of a run is spent, instead of the lint results ([#2206](https://github.com/textlint/textlint/pull/2206)).
The following output is the start of the profile of `preset-ja-technical-writing` on js-primer.

```
$ npx textlint --profile source/
## textlint profile

Total: 5871.34 ms, 105 files

### Phases

| Phase | Time (ms) | % | Count |
| --- | ---: | ---: | ---: |
| startup | 80.71 | 1.4% | 1 |
| load-config | 71.12 | 1.2% | 1 |
| search-files | 23.09 | 0.4% | 1 |
| lint | 5638.96 | 96.0% | 1 |
| ↳ parse | 74.81 | 1.3% | 105 |
| ↳ traverse | 171.79 | 2.9% | 105 |
| ↳ rules | 4623.91 | 78.8% | 285266 |
| ↳ post-process | 3.78 | 0.1% | 105 |
| format | 53.49 | 0.9% | 1 |

### Rules

| Rule | Time (ms) | % | Calls |
| --- | ---: | ---: | ---: |
| ja-technical-writing/no-double-negative-ja | 852.67 | 14.5% | 15498 |
| ja-technical-writing/ja-no-abusage | 632.59 | 10.8% | 15498 |
| ja-technical-writing/max-ten | 498.09 | 8.5% | 7199 |
...
```

A run with `--profile` is slower than a usual run, because textlint measures every call of a rule.
If your lint is slow, run it with `--profile` and look at the `Rules` table first.
See [Profile](https://textlint.org/docs/cli/#profile) for how to read the output.

### Comparison of two builds in CI

`pnpm run compare` in the textlint repository builds the base branch and the working tree, lints the same documents with both, and prints the differences.
The "Profile and benchmark" workflow runs it for every pull request.

- The documents are four sets: small (5 files), medium (js-primer), large (`web/javascript` of MDN Web Docs in Japanese), and huge (MDN Web Docs in Japanese).
- It compares the lint results, the run time of the CLI, the run time with `--fix`, the pause of the garbage collection, the parsers, and the traversal.
- A difference of the lint results is shown first, so a change that makes textlint faster but changes the results does not pass unnoticed.

kuromojin has the same comparison for the load of the dictionary, the analysis, and the memory.

The specifications are [Performance profile](https://github.com/textlint/textlint/blob/master/docs/products/textlint/features/performance-profile/requirements.md) and [Change comparison](https://github.com/textlint/textlint/blob/master/docs/products/textlint/features/change-comparison/requirements.md).

## How to update

1. Use Node.js 22.12.0 or later.
2. Update textlint to 16.1.3 or later.
3. Update your rules and presets, and the lock file.

```sh
npm install --save-dev textlint@latest
npm update
```

Then check the versions of the libraries.

```sh
npm ls kuromojin sentence-splitter
```

- `kuromojin` should be 3.1.0 or later, and `sentence-splitter` should be 5.1.0 or later.
- If `npm ls` shows two or more versions of `kuromojin`, each copy loads its own dictionary. See [Troubleshooting: use one copy of kuromojin](https://github.com/textlint/kuromojin#troubleshooting-use-one-copy-of-kuromojin).

## How we measured

- Each directory was installed with `npm install --before=<the end of the date in JST> textlint textlint-rule-preset-jtf-style textlint-rule-preset-ja-technical-writing`, so that textlint, the presets, and all of their dependencies are the versions of that day.
- Command: `textlint --format json` with a configuration that enables one preset with its default options.
- Documents: `files/ja` of [mdn/translated-content](https://github.com/mdn/translated-content) at `8a8b2ad7` (10,452 files), its `web/javascript` directory (1,043 files), and `source` of [js-primer](https://github.com/js-primer/js-primer) v7.0.0 (105 files).
- Machine: Linux with 4 CPUs, Node.js 22.23.5. The values are the median of 3 runs, all measured on 2026-11-23 on the same machine.
- Memory is the peak RSS of the process (`process.resourceUsage().maxRSS`).
- For "only textlint is new", the rules were installed as of 2026-11-08 and then `textlint@16.1.3` was installed. For "only the rules are new", textlint was installed as of 2026-11-08 and then the latest presets were installed.

The lint results are as follows.

- `preset-jtf-style` on MDN: the 177,741 messages are identical on every install date, including their positions.
- `preset-ja-technical-writing` on MDN `web/javascript`: the 12,613 messages have the same rules and texts on every install date. The columns of 1,390 messages differ, because sentence-splitter 5.1.0 fixed the columns that it reports.
- `preset-ja-technical-writing` on js-primer: 847 messages with textlint 15.8.0, and 850 with textlint 16. The three messages come from the parser changes of v16.0.0, not from the performance work.

## What is next

textlint lints files one by one in one thread.
To handle many more files, textlint needs something more fundamental, such as linting files in parallel.
It is hard for a linter whose rules are all added from outside: a rule may keep state across files, and each thread has to load the rules and their dictionaries again.
We do not know the best design yet.

If you have a large set of documents, please tell us the output of `textlint --profile` in [GitHub Discussions](https://github.com/textlint/textlint/discussions).
If textlint helps your work, you can support the development through [GitHub Sponsors](https://github.com/sponsors/azu).
