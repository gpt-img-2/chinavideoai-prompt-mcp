# China Video AI Prompt MCP

这是一个确定性、只读的 MCP 服务，用于整理中英文视频提示词、参考素材分镜和单变量调试方案。它配合 [ChinaVideoAI.com](https://chinavideoai.com) 使用，不会生成媒体、调用模型供应商、访问账户、比较实时价格或消耗积分。

## 工具

- `build_video_prompt`：把粗略想法整理成中英文结构化视频提示词。
- `plan_reference_shots`：生成包含参考角色和连续性约束的 1–6 镜头计划。
- `diagnose_video_prompt`：检查动作、镜头、光线和连续性信息，并保留参考素材标记。
- `get_china_video_resources`：返回 ChinaVideoAI.com 的提示词、工作流和模型导览资料。

所有工具均为只读、确定性逻辑，无需 API Key。

## 安装

可直接从 GitHub 运行：

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

或克隆到本地：

```bash
pnpm install
pnpm build
node dist/index.js
```

可选环境变量：`CHINAVIDEOAI_APP_BASE_URL`，默认值为 `https://chinavideoai.com`。

## OpenClaw Skill

配套 Skill 位于 [`openclaw/china-video-prompt-architect`](openclaw/china-video-prompt-architect/SKILL.md)。不连接 MCP 时可直接作为文字工作流使用；连接后可调用确定性的提示词构建、参考分镜和诊断工具。

## 验证

```bash
pnpm validate
```

本项目是独立的提示词设计工具，不是 Seedance、Kling、Wan、MiniMax 或任何模型的官方文档或官方实现。

- [China AI 视频生成器](https://chinavideoai.com/china-ai-video-generator)
- [参考图生视频指南](https://chinavideoai.com/blog/seedance-25-reference-to-video-guide)

## 许可证

MIT
