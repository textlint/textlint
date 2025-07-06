# textlint MCP Server Setup

[Model Context Protocol](https://modelcontextprotocol.io/) (MCP) is an open standard that enables AI models to interact with external tools and services through a unified interface. textlint CLI contains an MCP server that you can register with your code editor to allow LLMs to use textlint directly.

## Prerequisites

- textlint v14.8.0 or later
- AI-powered code editor with MCP support (VS Code with Copilot Chat, Cursor, or Windsurf)
- **A configured textlint project** - The MCP server requires an existing textlint configuration since textlint has no default rules

## Quick Start

First, you need to set up textlint in your project. textlint has no default rules, so you must configure rules before using the MCP server. See the [Configuring textlint](./configuring.md) guide for setup instructions.

After setting up textlint, start the MCP server with:

```bash
npx textlint --mcp
```

This starts textlint as an MCP server using stdio transport, allowing AI assistants to interact with textlint's linting and fixing capabilities.

## Using CLI Flags with MCP

Starting with textlint v15.2.0, the `--mcp` flag supports combination with other CLI arguments for enhanced flexibility. You can now pass additional configuration options when starting the MCP server:

```bash
# Use a specific config file
npx textlint --mcp --config .textlintrc.dev.json

# Use a custom ignore file
npx textlint --mcp --ignore-path .textlintignore.dev

# Combine with quiet mode (errors only)
npx textlint --mcp --quiet

# Use a custom rules directory
npx textlint --mcp --rules-base-directory ./custom-node-modules

# Combine multiple options
npx textlint --mcp --config .textlintrc.dev.json --quiet --ignore-path .textlintignore.dev
```

### Supported CLI Flags with MCP

The following CLI flags can be combined with `--mcp`:

- `--config <path>`: Specify a custom configuration file path
- `--ignore-path <path>`: Specify a custom `.textlintignore` file path
- `--quiet`: Report errors only (suppress warnings)
- `--rules-base-directory <path>`: Set custom node_modules directory for loading rules

These options provide the same functionality as the `McpServerOptions` type and allow for more flexible MCP server configuration without needing to modify your codebase.

## Setup in Different Editors

### VS Code with GitHub Copilot

To configure textlint MCP server in VS Code, create a `.vscode/mcp.json` file in your project:

```json
{
    "servers": {
        "textlint": {
            "type": "stdio",
            "command": "npx",
            "args": ["textlint", "--mcp"]
        }
    }
}
```

For custom configuration with CLI flags:

```json
{
    "servers": {
        "textlint": {
            "type": "stdio",
            "command": "npx",
            "args": ["textlint", "--mcp", "--config", ".textlintrc.dev.json", "--quiet"]
        }
    }
}
```

Alternatively, you can use the Command Palette:

1. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (macOS)
2. Type and select `MCP: Add Server`
3. Select `Command (stdio)` from the dropdown
4. Enter `npx textlint --mcp` as the command
5. Type `textlint` as the server ID
6. Choose `Workspace Settings` to create the configuration in `.vscode/mcp.json`

### Cursor

Create a `.cursor/mcp.json` file in your project directory:

```json
{
    "mcpServers": {
        "textlint": {
            "command": "npx",
            "args": ["textlint", "--mcp"],
            "env": {}
        }
    }
}
```

For custom configuration with CLI flags:

```json
{
    "mcpServers": {
        "textlint": {
            "command": "npx",
            "args": ["textlint", "--mcp", "--config", ".textlintrc.dev.json", "--quiet"],
            "env": {}
        }
    }
}
```

For global configuration, create `~/.cursor/mcp.json` in your home directory with the same configuration.

### Windsurf

1. Navigate to Windsurf → Settings → Advanced Settings
2. Scroll down to the Cascade section and click "Add Server"
3. Select "Add custom server +"
4. Add the following configuration to your `~/.codeium/windsurf/mcp_config.json`:

```json
{
    "mcpServers": {
        "textlint": {
            "command": "npx",
            "args": ["textlint", "--mcp"],
            "env": {}
        }
    }
}
```

For custom configuration with CLI flags:

```json
{
    "mcpServers": {
        "textlint": {
            "command": "npx",
            "args": ["textlint", "--mcp", "--config", ".textlintrc.dev.json", "--quiet"],
            "env": {}
        }
    }
}
```

5. Press the refresh button to update the available MCP servers

## Available Tools

The textlint MCP server provides four main tools:

### `lintFile`
Lint one or more files using textlint configuration.

**Parameters:**
- `filePaths` (Array): File paths to lint

**Example usage:**
```
"Lint the current file for text issues"
```

### `lintText`
Lint raw text content using textlint configuration.

**Parameters:**
- `text` (String): Text content to lint
- `stdinFilename` (String): Filename to use for the text (affects rule application)

**Example usage:**
```
"Check this text for writing issues: 'This is a sample text.'"
```

### `getLintFixedFileContent`
Get lint-fixed content of files using textlint's auto-fix capability. This tool returns the corrected content without modifying the original files.

**Parameters:**
- `filePaths` (Array): File paths to get fixed content for

**Example usage:**
```
"Get the textlint auto-fixed version of the current file"
```

### `getLintFixedTextContent`
Get lint-fixed content of raw text using textlint's auto-fix capability.

**Parameters:**
- `text` (String): Text content to get fixed version of
- `stdinFilename` (String): Filename to use for the text

**Example usage:**
```
"Get the auto-fixed version of this text and show me the corrected content"
```

## Configuration

**Important**: The textlint MCP server requires an existing textlint configuration to function properly. textlint doesn't include any rules by default, so you must configure your project before using the MCP server.

The textlint MCP server uses your existing textlint configuration:

- `.textlintrc.json` or other textlint config files
- Installed textlint rules and plugins
- Standard textlint ignore patterns

### Setting up textlint (Required)

Before using the MCP server, make sure you have:

1. **A textlint configuration file** in your project (`.textlintrc.json`, `.textlintrc.js`, etc.)
2. **Required textlint rules installed** as dependencies
3. **Appropriate plugins** for your file types

For detailed configuration instructions, see [Configuring textlint](./configuring.md).

## Example Prompts

Here are some example prompts you can use with AI assistants:

```
Lint the current file with textlint MCP and explain any text issues found

Get the auto-fixed content for src/README.md using textlint

Check this markdown text for writing problems and show me the corrected version

Get textlint auto-fixed content for all files in the docs/ directory
```

## Troubleshooting

If you encounter issues with the textlint MCP server:

1. **Check MCP server status**: Use your editor's MCP server list/status feature
2. **Verify textlint installation**: Ensure textlint and your rules are properly installed
3. **Check configuration**: Verify your `.textlintrc` file is valid
4. **Review logs**: Check MCP server logs for error messages
5. **Test manually**: Try running `npx textlint --mcp` in your terminal to see if the server starts

Common issues:
- Missing textlint configuration file
- Uninstalled textlint rules or plugins
- Incorrect file paths in MCP configuration
- Version compatibility (requires textlint v14.8.0+)

## Additional Resources

- [textlint Documentation](https://textlint.github.io/)
- [Model Context Protocol Documentation](https://modelcontextprotocol.io/introduction)
- [VS Code MCP Servers Documentation](https://code.visualstudio.com/docs/copilot/chat/mcp-servers)
- [GitHub Pull Request #1522](https://github.com/textlint/textlint/pull/1522) - Original MCP implementation

---

References:

- https://github.com/textlint/textlint/pull/1522
- https://eslint.org/docs/latest/use/mcp