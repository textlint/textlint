# Architecture

## Overview

```mermaid
sequenceDiagram
  CLI->>Loader: Load textlintrc
  Loader->>CLI: Return TextlintDescriptor
  CLI->>Linter: File*s* and TextlintDescriptor
  Linter->>Linter: File->Text
  Linter->>Kernel: Text
  Kernel->>Kernel: Linting text
  Kernel->>Linter: Message
  Linter->>CLI: Message*s*
  CLI->>Formatter: Message*s*
  Formatter->>CLI: Formatted output
  CLI->>CLI: Output
```

- CLI know Linter
- Linter know Kernel
- Kernel does not depend on other modules
  - Kernel work on Browser/Node.js

textlint apply [Separation of Concern](http://weblogs.asp.net/arturtrosin/separation-of-concern-vs-single-responsibility-principle-soc-vs-srp).

