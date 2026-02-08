# Model Context Protocol

**URL**: https://xsai.js.org/docs/integrations/tools/model-context-protocol

---

Tools # Model Context Protocol Model Context Protocol adapter for xsAI. > This code is untested, feel free to test it yourself and provide feedback. npmpnpmyarnbun ```
npm i @modelcontextprotocol/sdk @xsai/tool
``` ```
import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import type { Tool } from "@xsai/shared-chat";

export const getTools = (mcpServers: Record<string, Client>): Promise<Tool[]> =>
  Promise.all(
    Object.entries(mcpServers)
      .map(([serverName, client]) =>
        client
          .listTools()
          .then(({ tools }) =>
            tools.map(({ description, inputSchema, name }) => ({
              execute: (args: unknown) =>
                client.callTool({
                  arguments: args as Record<string, unknown>,
                  name,
                }).then((res) => JSON.stringify(res)),
              function: {
                description,
                name: name === serverName ? name : `${serverName}_${name}`,
                parameters: inputSchema,
                strict: true,
              },
              type: "function",
            } satisfies Tool))
          )
      ),
  ).then((tools) => tools.flat());
``` ## Examples ```
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'

import { getTools } from './utils/get-tools'

const transport = new StdioClientTransport({ command: 'node', args: ['server.js'] })
const client = new Client({ name: 'example-client', version: '1.0.0' })

await client.connect(transport)

const tools = await getTools({ example: client })
```[Edit on GitHub](https://github.com/moeru-ai/xsai/blob/main/docs/content/docs/integrations/tools/model-context-protocol.mdx)[Composio](/docs/integrations/tools/composio)[Composio adapter for xsAI.](/docs/integrations/tools/composio)[@xsai/embed](https://doc.deno.land/https://esm.sh/@xsai/embed)[Next Page](https://doc.deno.land/https://esm.sh/@xsai/embed)
