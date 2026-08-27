import assert from "node:assert/strict";

import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";

const expectedTools = [
  "build_video_prompt",
  "plan_reference_shots",
  "diagnose_video_prompt",
  "get_china_video_resources",
];

const serverCommand = process.env.MCP_SMOKE_COMMAND || "node";
const serverArgs = process.env.MCP_SMOKE_ARGS_JSON
  ? JSON.parse(process.env.MCP_SMOKE_ARGS_JSON)
  : ["bin/chinavideoai-prompt-mcp.js"];

const client = new Client({ name: "chinavideoai-smoke", version: "1.0.0" });
const transport = new StdioClientTransport({
  command: serverCommand,
  args: serverArgs,
  cwd: process.cwd(),
});

try {
  await client.connect(transport);
  const { tools } = await client.listTools();
  const names = tools.map((tool) => tool.name);
  assert.deepEqual([...names].sort(), [...expectedTools].sort());

  const result = await client.callTool({
    name: "build_video_prompt",
    arguments: {
      idea: "A cinematic product reveal for a glass bottle",
      workflow: "image-to-video",
      aspectRatio: "9:16",
    },
  });
  const first = result.content?.[0];
  assert.equal(first?.type, "text");
  assert.match(first?.type === "text" ? first.text : "", /chinavideoai\.com/);

  console.log(`MCP smoke passed: ${names.join(", ")}`);
} finally {
  await client.close();
}
