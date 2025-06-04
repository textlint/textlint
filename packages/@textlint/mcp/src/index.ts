#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createLinter, loadTextlintrc, type CreateLinterOptions } from "textlint";
import { z } from "zod";
import pkg from "../package.json";

const server = new McpServer({
    name: "textlint",
    version: pkg.version,
});

const makeLinterOptions = async (): Promise<CreateLinterOptions> => {
    const descriptor = await loadTextlintrc();
    return {
        descriptor,
    };
};

server.tool(
    "lintFile",
    "Lint files using textlint",
    {
        filePaths: z.array(z.string().min(1)).nonempty(),
    },
    async ({ filePaths }) => {
        const linterOptions = await makeLinterOptions();
        const linter = createLinter(linterOptions);

        const results = await linter.lintFiles(filePaths);
        const content = results.map((result) => ({
            type: "text" as const,
            text: JSON.stringify(result),
        }));

        return { content };
    }
);

server.tool(
    "lintText",
    "Lint text using textlint",
    {
        text: z.string().nonempty(),
        stdinFilename: z.string().nonempty(),
    },
    async ({ text, stdinFilename }) => {
        const linterOptions = await makeLinterOptions();
        const linter = createLinter(linterOptions);

        const result = await linter.lintText(text, stdinFilename);
        const content = [
            {
                type: "text" as const,
                text: JSON.stringify(result),
            },
        ];

        return { content };
    }
);

server.tool(
    "fixFile",
    "Fix files using textlint",
    {
        filePaths: z.array(z.string().min(1)).nonempty(),
    },
    async ({ filePaths }) => {
        const linterOptions = await makeLinterOptions();
        const linter = createLinter(linterOptions);

        const results = await linter.fixFiles(filePaths);
        const content = results.map((result) => ({
            type: "text" as const,
            text: JSON.stringify(result),
        }));

        return { content };
    }
);
server.tool(
    "fixText",
    "Fix text using textlint",
    {
        text: z.string().nonempty(),
        stdinFilename: z.string().nonempty(),
    },
    async ({ text, stdinFilename }) => {
        const linterOptions = await makeLinterOptions();
        const linter = createLinter(linterOptions);

        const result = await linter.fixText(text, stdinFilename);
        const content = [
            {
                type: "text" as const,
                text: JSON.stringify(result),
            },
        ];

        return { content };
    }
);

export { server };
