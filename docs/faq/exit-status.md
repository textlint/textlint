# Exit Status

textlint returns different exit status codes based on the result of file processing. This document systematically explains the exit status behavior in various situations.

> **Note**: The patterns described below are covered by comprehensive tests in [`packages/textlint/test/cli/cli-exit-status-faq.test.ts`](../../packages/textlint/test/cli/cli-exit-status-faq.test.ts).

## Exit Status Overview

| Exit Status | Description |
|-------------|-------------|
| 0 | Success - No errors, or no target files (ignored, etc.) |
| 1 | Failure - Lint errors found |
| 2 | Failure - File search errors or output writing errors |

## Exit Status 2 Details

textlint v15+ returns exit status 2 for file search related errors. This aligns with ESLint's behavior.

### Cases that trigger file search errors
- Specifying non-existent files
- Specifying non-existent glob patterns
- File system access errors

### Comparison with ESLint
ESLint provides the `--no-error-on-unmatched-pattern` flag to control this behavior, but textlint does not currently implement such a flag.

```bash
# ESLint
eslint non-existent.js                              # Exit Status: 2
eslint --no-error-on-unmatched-pattern non-existent.js  # Exit Status: 0

# textlint
textlint non-existent.md                           # Exit Status: 2
```

## Detailed Behavior Patterns

### 1. Success Cases (Exit Status: 0)

#### 1.1 File exists and no lint errors
```bash
textlint --rule no-todo existing-file.md
# Exit Status: 0
```

#### 1.2 File is ignored
```bash
textlint --rule no-todo --ignore-path .textlintignore ignored-file.md
# Exit Status: 0
# Reason: Ignored files are treated as out of scope
```

#### 1.3 Multiple files with some non-existent
```bash
textlint --rule no-todo existing-file.md nonexistent-file.md
# Exit Status: 0
# Reason: Only existing files are processed
```

#### 1.4 Non-existent ignore file
```bash
textlint --rule no-todo --ignore-path nonexistent.textlintignore existing-file.md
# Exit Status: 0
# Reason: Non-existent ignore files are silently ignored (no error)
```

#### 1.5 All files are ignored
```bash
textlint --rule no-todo --ignore-path ignore-all.textlintignore '*.md'
# Exit Status: 0
# Reason: No target files to process is treated as success
```

#### 1.6 Output file is specified
```bash
textlint --rule no-todo --output-file output.txt file-with-error.md
# Exit Status: 0
# Reason: Always returns 0 when --output-file is specified (same as ESLint)
```

#### 1.7 Invalid CLI options
```bash
textlint --invalid-option
# Exit Status: 1 (when run from command line)
# Exit Status: 0 (when executed programmatically, shows help)
# Error message: Error: Invalid option '--invalid-option' - perhaps you meant...
```

> **Note**: Invalid options behave differently between command line execution and programmatic CLI execution:
> - Command line: optionator library throws error, exit status 1
> - Programmatic: Help is displayed, exit status 0
> 
> This difference is due to optionator library's internal implementation and TTY environment differences.

### 2. Lint Error Cases (Exit Status: 1)

#### 2.1 File exists and has lint errors
```bash
textlint --rule no-todo file-with-todo.md
# Exit Status: 1
# Reason: Lint errors detected
```

### 3. File Search Error Cases (Exit Status: 2)

#### 3.1 Specified file does not exist
```bash
textlint --rule no-todo nonexistent-file.md
# Exit Status: 2
# Error message: Failed to search files. Error details: [ { type: 'SearchFilesNoTargetFileError' } ]
# File search failed: [ { type: 'SearchFilesNoTargetFileError' } ]
```

#### 3.2 Glob pattern with no matching files
```bash
textlint --rule no-todo 'nonexistent-dir/**/*.md'
# Exit Status: 2
# Error message: Failed to search files. Error details: [ { type: 'SearchFilesNoTargetFileError' } ]
```

#### 3.3 Absolute path to non-existent file
```bash
textlint --rule no-todo /nonexistent/path/file.md
# Exit Status: 2
# Error message: Failed to search files. Error details: [ { type: 'SearchFilesNoTargetFileError' } ]
```

#### 3.4 Non-existent directory in glob
```bash
textlint --rule no-todo '/nonexistent-dir/**/*.md'
# Exit Status: 2
# Error message: Failed to search files. Error details: [ { type: 'SearchFilesNoTargetFileError' } ]
```

#### 3.5 `--fix` option with non-existent file
```bash
textlint --rule no-todo --fix nonexistent-file.md
# Exit Status: 2
# Error message: Failed to search files with patterns: nonexistent-file.md. Reason: SearchFilesNoTargetFileError
# File search failed: [ { type: 'SearchFilesNoTargetFileError' } ]
```

## Comparison with Other Lint Tools

### ESLint
- File not found: Exit Status 2
- Lint errors: Exit Status 1
- Success: Exit Status 0
- --output-file specified: Always Exit Status 0

### textlint
- File not found: Exit Status 2 ✅
- Lint errors: Exit Status 1
- Success: Exit Status 0
- --output-file specified: Always Exit Status 0

textlint follows the same exit status rules as ESLint, allowing scripts to distinguish between file search errors and lint errors.

## Implementation Details

The implementation of this feature involves:

- **CLI layer** ([`cli.ts`](../../packages/textlint/src/cli.ts)): Catches `TextlintFileSearchError` and returns exit status 2
- **Linter layer** ([`createLinter.ts`](../../packages/textlint/src/createLinter.ts)): Throws `TextlintFileSearchError` when file search fails
- **Error class** ([`FileSearchError.ts`](../../packages/textlint/src/error/FileSearchError.ts)): Custom error class for file search failures

## Best Practices

### 1. CI/CD Usage
```bash
# Basic usage
textlint "**/*.md" && echo "Lint passed"

# Distinguish different error types
textlint "**/*.md"
exit_code=$?
case $exit_code in
  0) echo "Success: No lint errors found" ;;
  1) echo "Lint errors found" ;;
  2) echo "File search errors (files not found)" ;;
  *) echo "Unexpected error" ;;
esac
```

### 2. Error handling
```bash
# Distinguish file search errors from lint errors
textlint "**/*.md"
exit_code=$?
if [ $exit_code -eq 2 ]; then
  echo "Warning: Some files not found, but this might be expected"
  exit 0
elif [ $exit_code -eq 1 ]; then
  echo "Error: Lint errors found"
  exit 1
fi
```

### 3. Multiple file processing
```bash
# Mixed existing and non-existing files - only existing files are processed
textlint existing-file.md nonexistent-file.md  # Exit Status: 0

# Only non-existing files - returns error
textlint nonexistent-file.md  # Exit Status: 2
```

### 4. Using ignore files
```bash
# Non-existent ignore files don't cause errors
textlint --ignore-path .textlintignore "**/*.md"  # Exit Status: 0

# All files ignored is treated as success
textlint --ignore-path ignore-all.textlintignore "**/*.md"  # Exit Status: 0
```

## Troubleshooting

### Q: File exists but Exit Status 1 is returned
**A**: Possible causes:
1. Lint errors are detected
2. File is ignored (check `--ignore-path`)
3. File extension is not supported

### Q: Ignore file patterns are not working
**A**: Check the following:
1. Ignore file path is correct
2. Pattern syntax is correct (glob format)
3. File character encoding is correct

### Q: Behavior with large file sets where some files don't exist
**A**: Only existing files are processed and Exit Status 0 is returned. Exit Status 2 is only returned when all specified files are non-existent.

## Comparison with ESLint's `--no-error-on-unmatched-pattern` Flag

### ESLint's Approach

ESLint added the `--no-error-on-unmatched-pattern` flag in [Issue #10587](https://github.com/eslint/eslint/issues/10587) to provide flexible handling when file patterns are not found.

#### ESLint Behavior
```bash
# Default (causes error)
eslint "nonexistent-dir/**/*.js"
# Exit Status: 2, Error: "No files matching the pattern were found."

# With flag (no error)
eslint --no-error-on-unmatched-pattern "nonexistent-dir/**/*.js"
# Exit Status: 0
```

#### Main Use Cases
1. **Unified lint commands in monorepos**: Use the same command even when some directories don't exist in certain projects
2. **Flexible CI/CD execution**: Don't error when files conditionally don't exist
3. **Docker environments**: Run linting on partial project copies

### Comparison with textlint Current Status

| Situation | textlint v15+ | ESLint (default) | ESLint (--no-error-on-unmatched-pattern) |
|-----------|---------------|------------------|------------------------------------------|
| Single non-existent file | Exit Status 2 ✅ | Exit Status 2 | Exit Status 0 |
| Non-existent glob | Exit Status 2 ✅ | Exit Status 2 | Exit Status 0 |
| Multiple files (some non-existent) | Exit Status 0 | Exit Status 0 | Exit Status 0 |

### Current Workarounds for textlint

#### 1. Multiple file specification workaround
```bash
# This works with current implementation (Exit Status 0)
textlint existing-file.md nonexistent-file.md
```

#### 2. Conditional execution workaround
```bash
# Shell conditional
if [ -d "packages/app" ]; then
  textlint "packages/app/**/*.md"
fi

# More complex cases
find . -name "*.md" -type f | grep -E "(packages|docs)" | xargs textlint
```

#### 3. Error handling
```bash
# Distinguish file search errors from lint errors
textlint "**/*.md"
exit_code=$?
if [ $exit_code -eq 2 ]; then
  echo "Warning: Some files not found, but this might be expected"
  exit 0
elif [ $exit_code -eq 1 ]; then
  echo "Error: Lint errors found"
  exit 1
fi
```

## Future Improvements

### Proposal: Add `--no-error-on-unmatched-pattern` Flag

Adopting the same approach as ESLint could improve usability in monorepos and conditional file processing:

```bash
# Proposed: Implementation in future versions
textlint --no-error-on-unmatched-pattern "nonexistent-dir/**/*.md"
# Exit Status: 0 (no error even when files are not found)
```

This feature would provide the following benefits:

1. **Unified configuration in monorepos**: Use the same lint command across projects with different directory structures
2. **CI/CD flexibility**: Pipelines don't fail when files conditionally don't exist
3. **Consistency with ESLint**: Predictable behavior for existing ESLint users
