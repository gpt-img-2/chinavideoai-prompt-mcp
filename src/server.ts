import { McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";

import { loadConfig } from "./config.js";
import { buildVideoPrompt, diagnosePrompt } from "./lib/prompt.js";
import { getChinaVideoResources } from "./lib/resources.js";
import { planReferenceShots } from "./lib/shots.js";

const SERVER_INSTRUCTIONS = `China Video AI Prompt MCP is a deterministic, read-only toolkit for video prompt design.

Use build_video_prompt for rough ideas, plan_reference_shots for reference-aware sequences, diagnose_video_prompt before adding more detail, and get_china_video_resources for canonical ChinaVideoAI.com guidance. Preserve @Image, @Video, and @Audio reference tokens exactly. The server does not generate media, call model providers, access accounts, spend credits, compare live prices, or act as official documentation for any model provider.`;

const readOnlyAnnotations = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
};

function text(value: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text:
          typeof value === "string" ? value : JSON.stringify(value, null, 2),
      },
    ],
  };
}

export function createServer() {
  const config = loadConfig();
  const server = new McpServer(
    { name: "chinavideoai-prompt-mcp", version: "1.0.0" },
    { instructions: SERVER_INSTRUCTIONS },
  );

  server.registerTool(
    "build_video_prompt",
    {
      title: "Build a China AI video prompt",
      description:
        "Turn a rough idea into a deterministic English or Chinese prompt pack with motion, camera, lighting, reference, and continuity controls. This does not generate video.",
      inputSchema: z.object({
        idea: z.string().min(1).max(5000),
        workflow: z
          .enum(["text-to-video", "image-to-video", "video-to-video"])
          .default("text-to-video"),
        outputLanguage: z.enum(["auto", "en", "zh"]).default("auto"),
        durationSeconds: z.number().int().min(1).max(120).default(5),
        aspectRatio: z.string().max(40).default("16:9"),
        camera: z.string().max(500).optional(),
        motion: z.string().max(1000).optional(),
        lighting: z.string().max(500).optional(),
        style: z.string().max(500).optional(),
        referenceConstraints: z.string().max(1000).optional(),
        negativeConstraints: z.string().max(1000).optional(),
      }),
      annotations: readOnlyAnnotations,
    },
    async (params) =>
      text({
        ...buildVideoPrompt(params),
        referenceGuideUrl: `${config.appBaseUrl}/blog/seedance-25-reference-to-video-guide`,
        generatorUrl: `${config.appBaseUrl}/china-ai-video-generator`,
      }),
  );

  server.registerTool(
    "plan_reference_shots",
    {
      title: "Plan a reference-aware shot sequence",
      description:
        "Break one video idea into 1 to 6 timed shots with reference roles, camera direction, end frames, and continuity anchors. Read-only and deterministic.",
      inputSchema: z.object({
        idea: z.string().min(1).max(5000),
        shotCount: z.number().int().min(1).max(6).default(3),
        totalDurationSeconds: z.number().int().min(1).max(120).default(9),
        continuityAnchor: z.string().max(1000).optional(),
        cameraStyle: z.string().max(500).optional(),
        referenceRoles: z.string().max(1500).optional(),
      }),
      annotations: readOnlyAnnotations,
    },
    async (params) => text(planReferenceShots(params)),
  );

  server.registerTool(
    "diagnose_video_prompt",
    {
      title: "Diagnose a video prompt",
      description:
        "Check an English or Chinese prompt for a readable scene, visible motion, camera direction, lighting, continuity controls, and preserved reference tokens.",
      inputSchema: z.object({
        prompt: z.string().min(1).max(10000),
      }),
      annotations: readOnlyAnnotations,
    },
    async ({ prompt }) => text(diagnosePrompt(prompt)),
  );

  server.registerTool(
    "get_china_video_resources",
    {
      title: "Get China AI video resources",
      description:
        "Return canonical ChinaVideoAI.com prompting, workflow, model-orientation, or safety resources. Does not fetch external content.",
      inputSchema: z.object({
        topic: z
          .enum(["all", "prompting", "workflows", "models", "safety"])
          .default("all"),
      }),
      annotations: readOnlyAnnotations,
    },
    async ({ topic }) =>
      text({
        topic,
        resources: getChinaVideoResources(config.appBaseUrl, topic),
        rawSkillUrl: `${config.appBaseUrl}/skills/china-video-prompt-architect/SKILL.md`,
      }),
  );

  return server;
}
