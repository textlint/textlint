---
id: ignore
title: Ignoring Text
---

Use `.textlintignore` to ignore certain files and folders completely.

Use [textlint-filter-rule-comments](https://github.com/textlint/textlint-filter-rule-comments) to ignore parts of files.

### Ignoring Files: .textlintignore

To exclude files from linting, create a `.textlintignore` file in the root of your project.

Example:

```
# Ignore file:
ignored.md

# Ignore by glob pattern:
vendor/**
```

:memo: textlint supports [glob pattern of node-glob](https://github.com/isaacs/node-glob#glob-primer).

You can also specify path to a file containing patterns that describes files to ignore by `--ignore-path` flag.

### Ignoring parts of files

[textlint-filter-rule-comments](https://github.com/textlint/textlint-filter-rule-comments) provide filtering function by using comments.

```
<!-- textlint-disable -->

Disables all rules between comments

<!-- textlint-enable -->`
```

Allow to short `textlint-filter-rule-comments` to `comments`.

Add filter rule name to `filters` field.

```json
{
  "filters": {
    "comments": true
  }
}
```
