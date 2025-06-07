import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { server } from "./server";

const connectMcpServer = async () => {
    await server.connect(new StdioServerTransport());
    return server;
};

export { connectMcpServer };
