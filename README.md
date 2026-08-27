# China Video AI Prompt MCP

A deterministic, read-only MCP server for designing English or Chinese video prompts, reference-aware shot plans, and focused revisions. It complements [ChinaVideoAI.com](https://chinavideoai.com) and does not generate media, call model providers, access accounts, compare live prices, or spend credits.

## Tools

- `build_video_prompt` turns a rough idea into a structured English or Chinese prompt pack.
- `plan_reference_shots` creates a timed 1–6 shot sequence with reference roles and continuity anchors.
- `diagnose_video_prompt` finds missing motion, camera, lighting, and continuity controls while preserving reference tokens.
- `get_china_video_resources` returns canonical ChinaVideoAI.com guides and workflow pages.

All tools are deterministic and declare read-only MCP annotations. No API key is required.

## Install

Run directly from GitHub:

```json
{
  "mcpServers": {
    "chinavideoai": {
      "command": "npx",
      "args": ["-y", "github:gpt-img-2/chinavideoai-prompt-mcp"]
    }
  }
}
```

Or clone and run locally:

```bash
pnpm install
pnpm build
node dist/index.js
```

Optional environment variable:

- `CHINAVIDEOAI_APP_BASE_URL`: changes the resource-link origin. Defaults to `https://chinavideoai.com`.

## Example inputs

Build a bilingual-aware prompt:

```json
{
  "idea": "一只白鹭从清晨薄雾中的湖面起飞",
  "workflow": "image-to-video",
  "camera": "低机位缓慢跟拍",
  "referenceConstraints": "保留 @Image1 中白鹭的羽毛纹理与湖岸构图"
}
```

Plan reference-aware shots:

```json
{
  "idea": "A trail shoe crosses wet rock and lands in a shallow stream",
  "shotCount": 3,
  "totalDurationSeconds": 9,
  "referenceRoles": "@Image1 controls product geometry; @Video1 controls motion timing",
  "continuityAnchor": "shoe color, laces, runner wardrobe, and travel direction"
}
```

## OpenClaw Skill

The companion Skill is in [`openclaw/china-video-prompt-architect`](openclaw/china-video-prompt-architect/SKILL.md). It works as a text-only workflow without this MCP; connecting the MCP adds deterministic prompt-building and diagnostic tools.

## Development

```bash
pnpm validate
```

This project is an independent prompt-design utility and is not official documentation or an official implementation of Seedance, Kling, Wan, MiniMax, or any other model.

- [中文说明](README.zh-CN.md)
- [China AI video generator](https://chinavideoai.com/china-ai-video-generator)
- [Reference-to-video guide](https://chinavideoai.com/blog/seedance-25-reference-to-video-guide)

## License

MIT
