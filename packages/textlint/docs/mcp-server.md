# MCP Server Configuration

textlint includes a Model Context Protocol (MCP) server that allows integration with MCP-compatible clients. The MCP server provides textlint functionality through a standardized protocol.

## Basic Usage

### Starting the MCP Server

```bash
# Start MCP server with default configuration
textlint --mcp

# Or programmatically
import { connectStdioMcpServer } from "textlint";
await connectStdioMcpServer();
```

### Available Tools

The MCP server provides the following tools:

- `lintFile`: Lint files using textlint
- `lintText`: Lint text content using textlint  
- `getLintFixedFileContent`: Get lint-fixed content of files
- `getLintFixedTextContent`: Get lint-fixed content of text

## Configuration Options

The `setupServer` function accepts optional configuration parameters:

```typescript
import { setupServer, McpServerOptions } from "textlint";

const options: McpServerOptions = {
  // Configuration file options
  configFilePath: "/path/to/.textlintrc",
  node_modulesDir: "/custom/node_modules",
  
  // Linter options
  ignoreFilePath: "/path/to/.textlintignore",
  quiet: true,                    // Report errors only
  cwd: "/working/directory",      // Current working directory
  
  // Direct configuration (primarily for testing)
  descriptor: customDescriptor    // Direct configuration object
};

const server = await setupServer(options);
```

### Configuration Option Details

#### Configuration File Options

- **configFilePath**: Path to textlint configuration file (`.textlintrc`, etc.)
- **node_modulesDir**: Custom node_modules directory for loading plugins/rules

#### Linter Options

- **ignoreFilePath**: Path to `.textlintignore` file
- **quiet**: When `true`, only reports errors (filters out warnings)
- **cwd**: Current working directory for relative path resolution

#### Direct Configuration

- **descriptor**: Direct `TextlintKernelDescriptor` object for advanced use cases and testing

## Examples

### Using Custom Configuration File

```typescript
import { setupServer } from "textlint";

const server = await setupServer({
  configFilePath: "/path/to/custom/.textlintrc",
  quiet: true
});
```

### Testing with Custom Rules

```typescript
import { TextlintKernelDescriptor } from "@textlint/kernel";
import { builtInPlugins } from "textlint";

const testDescriptor = new TextlintKernelDescriptor({
  rules: [
    { ruleId: "test-rule", rule: testRule, options: true }
  ],
  plugins: builtInPlugins
});

const server = await setupServer({
  descriptor: testDescriptor
});
```

### Production Setup with Project Configuration

```typescript
const server = await setupServer({
  configFilePath: "./project/.textlintrc.json",
  ignoreFilePath: "./project/.textlintignore",
  cwd: process.cwd(),
  quiet: false
});
```

## Backward Compatibility

All configuration options are optional. When no options are provided, the server uses the default behavior:

```typescript
// This maintains existing behavior
const server = await setupServer();
```

The server will automatically:
1. Load configuration from default textlint config files
2. Use built-in plugins if no configuration is found
3. Apply default linter settings

## Error Handling

The MCP server handles various error scenarios gracefully:

- **Missing configuration files**: Falls back to built-in configuration
- **Invalid file paths**: Returns structured error responses
- **Unsupported file types**: Handles gracefully based on available plugins
- **Empty or malformed input**: Processes without throwing errors

All responses follow the MCP specification and include structured error information when applicable.