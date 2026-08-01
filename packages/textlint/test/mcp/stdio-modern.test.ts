import path from "node:path";
import { describe, expect, it } from "vitest";
import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";

const packageRoot = path.join(__dirname, "../..");
const textlintBinPath = path.join(packageRoot, "bin/textlint.js");
const configFilePath = path.join(__dirname, "fixtures/configs/minimal-config.json");
const nodeModulesDirectory = path.join(packageRoot, "node_modules");

describe("MCP stdio server", () => {
    it("serves the 2026-07-28 protocol", async () => {
        const transport = new StdioClientTransport({
            command: process.execPath,
            args: [
                textlintBinPath,
                "--mcp",
                "--config",
                configFilePath,
                "--rules-base-directory",
                nodeModulesDirectory
            ],
            cwd: packageRoot,
            stderr: "pipe"
        });
        const client = new Client(
            {
                name: "textlint-stdio-test",
                version: "1.0.0"
            },
            {
                versionNegotiation: {
                    mode: {
                        pin: "2026-07-28"
                    }
                }
            }
        );

        try {
            await client.connect(transport);

            expect(client.getProtocolEra()).toBe("modern");
            expect(client.getNegotiatedProtocolVersion()).toBe("2026-07-28");

            const { tools } = await client.listTools();
            expect(tools.map((tool) => tool.name)).toEqual([
                "lintFile",
                "lintText",
                "getLintFixedFileContent",
                "getLintFixedTextContent"
            ]);

            const result = await client.callTool({
                name: "lintText",
                arguments: {
                    text: "This is OK.",
                    stdinFilename: "test.md"
                }
            });
            expect(result).toMatchObject({
                isError: false,
                structuredContent: {
                    filePath: "test.md",
                    messages: []
                }
            });
        } finally {
            await client.close();
        }
    }, 15_000);
});
