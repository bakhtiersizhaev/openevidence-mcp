import test from "node:test";
import assert from "node:assert/strict";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { ListPromptsResultSchema, ListToolsResultSchema } from "@modelcontextprotocol/sdk/types.js";

test("MCP server exposes agent instructions and expected tools", async () => {
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: ["--import", "tsx", "src/server.ts"],
    cwd: process.cwd(),
    stderr: "pipe",
  });
  const client = new Client({ name: "contract-test", version: "1.0.0" });

  await client.connect(transport);
  try {
    const instructions = client.getInstructions() ?? "";
    assert.match(instructions, /oe_auth_status/);
    assert.match(instructions, /wait_for_completion=false/);
    assert.match(instructions, /oe_article_wait/);
    assert.match(instructions, /original_article_id/);
    assert.match(instructions, /browser profile/i);
    assert.match(instructions, /login:session/i);

    const tools = await client.request(
      { method: "tools/list", params: {} },
      ListToolsResultSchema,
    );
    const byName = new Map(tools.tools.map((tool) => [tool.name, tool]));

    for (const name of [
      "oe_auth_status",
      "oe_history_list",
      "oe_article_get",
      "oe_article_wait",
      "oe_ask",
      "oe_citations_get",
    ]) {
      assert.ok(byName.has(name), `expected tool ${name}`);
    }

    assert.equal(byName.get("oe_auth_status")?.annotations?.readOnlyHint, true);
    assert.equal(byName.get("oe_history_list")?.annotations?.readOnlyHint, true);
    assert.equal(byName.get("oe_article_get")?.annotations?.readOnlyHint, true);
    assert.equal(byName.get("oe_article_wait")?.annotations?.readOnlyHint, true);
    assert.equal(byName.get("oe_ask")?.annotations?.readOnlyHint, false);
    assert.equal(byName.get("oe_citations_get")?.annotations?.readOnlyHint, true);

    // The oe_ask schema must only advertise inputs the server actually honors.
    const askSchema = byName.get("oe_ask")?.inputSchema as { properties?: Record<string, unknown> };
    const askInputs = Object.keys(askSchema?.properties ?? {}).sort();
    assert.deepEqual(askInputs, [
      "original_article_id",
      "poll_interval_ms",
      "question",
      "timeout_sec",
      "wait_for_completion",
    ]);

    assert.match(byName.get("oe_ask")?.description ?? "", /wait_for_completion=false/);
    assert.match(byName.get("oe_article_wait")?.description ?? "", /long research questions/);

    const prompts = await client.request(
      { method: "prompts/list", params: {} },
      ListPromptsResultSchema,
    );
    const workflowPrompt = prompts.prompts.find(
      (prompt) => prompt.name === "openevidence_research_workflow",
    );
    assert.ok(workflowPrompt);
    assert.match(workflowPrompt.description ?? "", /non-blocking ask/);
  } finally {
    await transport.close();
  }
});
