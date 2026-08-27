export type VideoWorkflow =
  | "text-to-video"
  | "image-to-video"
  | "video-to-video";

export type OutputLanguage = "auto" | "en" | "zh";

export type BuildVideoPromptParams = {
  idea: string;
  workflow?: VideoWorkflow | undefined;
  outputLanguage?: OutputLanguage | undefined;
  durationSeconds?: number | undefined;
  aspectRatio?: string | undefined;
  camera?: string | undefined;
  motion?: string | undefined;
  lighting?: string | undefined;
  style?: string | undefined;
  referenceConstraints?: string | undefined;
  negativeConstraints?: string | undefined;
};

function clean(value: string | undefined) {
  return (value || "").replace(/\s+/g, " ").trim();
}

function resolveLanguage(
  requested: OutputLanguage | undefined,
  sample: string,
): "en" | "zh" {
  if (requested === "en" || requested === "zh") return requested;
  return /[\u3400-\u9fff]/.test(sample) ? "zh" : "en";
}

const copy = {
  en: {
    camera: "one stable, motivated camera move",
    motion: "one clear subject action with physically coherent motion",
    lighting: "consistent cinematic lighting",
    style: "coherent production design with realistic spatial continuity",
    workflow: "Workflow",
    duration: "Duration",
    seconds: "seconds",
    aspectRatio: "Aspect ratio",
    motionLabel: "Motion",
    cameraLabel: "Camera",
    lightingLabel: "Lighting",
    styleLabel: "Visual style",
    preserve: "Preserve from the reference",
    avoid: "Avoid",
    stable:
      "Keep identity, anatomy, object geometry, lighting, and screen direction stable.",
    artifacts:
      "Avoid flicker, duplicate subjects, warped details, abrupt camera changes, and drifting composition.",
    revisionMoves: [
      "Change only the subject action or motion intensity.",
      "Change only the framing, lens feel, or camera move.",
      "Tighten reference, continuity, or negative constraints without adding new subjects.",
    ],
  },
  zh: {
    camera: "一个稳定且有动机的镜头运动",
    motion: "一个清晰、符合物理规律的主体动作",
    lighting: "前后一致的电影感光线",
    style: "统一的视觉设计与真实的空间连续性",
    workflow: "工作流",
    duration: "时长",
    seconds: "秒",
    aspectRatio: "画幅",
    motionLabel: "主体动作",
    cameraLabel: "镜头",
    lightingLabel: "光线",
    styleLabel: "视觉风格",
    preserve: "保留参考素材中的",
    avoid: "避免",
    stable: "保持身份、解剖结构、物体几何、光线和运动方向稳定。",
    artifacts: "避免闪烁、重复主体、细节变形、镜头突变和构图漂移。",
    revisionMoves: [
      "只调整主体动作或动作强度。",
      "只调整景别、镜头质感或运镜。",
      "收紧参考、连续性或负面约束，不新增主体。",
    ],
  },
} as const;

export function buildVideoPrompt(params: BuildVideoPromptParams) {
  const idea = clean(params.idea);
  const workflow = params.workflow || "text-to-video";
  const outputLanguage = resolveLanguage(params.outputLanguage, idea);
  const labels = copy[outputLanguage];
  const durationSeconds = params.durationSeconds || 5;
  const aspectRatio = clean(params.aspectRatio) || "16:9";
  const camera = clean(params.camera) || labels.camera;
  const motion = clean(params.motion) || labels.motion;
  const lighting = clean(params.lighting) || labels.lighting;
  const style = clean(params.style) || labels.style;
  const referenceConstraints = clean(params.referenceConstraints);
  const negativeConstraints = clean(params.negativeConstraints);

  const constraints = [
    referenceConstraints ? `${labels.preserve}: ${referenceConstraints}.` : "",
    negativeConstraints ? `${labels.avoid}: ${negativeConstraints}.` : "",
    labels.stable,
    labels.artifacts,
  ].filter(Boolean);

  const prompt = [
    idea,
    `${labels.workflow}: ${workflow}. ${labels.duration}: ${durationSeconds}${labels.seconds}. ${labels.aspectRatio}: ${aspectRatio}.`,
    `${labels.motionLabel}: ${motion}. ${labels.cameraLabel}: ${camera}.`,
    `${labels.lightingLabel}: ${lighting}. ${labels.styleLabel}: ${style}.`,
    ...constraints,
  ].join(" ");

  return {
    workflow,
    outputLanguage,
    subjectAndScene: idea,
    motion,
    camera,
    lighting,
    style,
    durationSeconds,
    aspectRatio,
    referenceConstraints: referenceConstraints || null,
    constraints,
    prompt,
    revisionMoves: [...labels.revisionMoves],
  };
}

const motionTerms =
  /\b(walk|run|turn|rise|fall|move|rotate|drift|flow|sway|push|pull|track|pan|tilt|zoom|orbit|dolly|crane)\w*\b|走|跑|转身|升起|下落|移动|旋转|漂移|流动|摇曳|推进|拉远|平移|摇镜|环绕|跟拍/i;
const cameraTerms =
  /\b(camera|shot|close-up|wide|medium|macro|lens|tracking|handheld|drone|dolly|pan|tilt|zoom|orbit|push-in|pull-back)\b|镜头|特写|近景|中景|全景|广角|长焦|手持|航拍|推镜|拉镜|摇镜|环绕|跟拍/i;
const lightingTerms =
  /\b(light|lighting|sunrise|sunset|neon|golden hour|rim light|softbox|shadow|contrast|exposure)\b|光线|灯光|日出|日落|霓虹|黄金时刻|轮廓光|柔光|阴影|对比度|曝光/i;
const continuityTerms =
  /\b(stable|consistent|preserve|unchanged|continuity|same subject|same character|same product)\b|稳定|一致|保留|不变|连续性|同一主体|同一角色|同一产品/i;
const referenceTokenTerms = /@(Image|Video|Audio)\d+|@(?:图片|视频|音频)\d+/i;

export function diagnosePrompt(prompt: string) {
  const normalized = clean(prompt);
  const checks = [
    { area: "subject and scene", present: normalized.length >= 20 },
    { area: "visible motion", present: motionTerms.test(normalized) },
    { area: "camera direction", present: cameraTerms.test(normalized) },
    { area: "lighting", present: lightingTerms.test(normalized) },
    {
      area: "continuity constraint",
      present: continuityTerms.test(normalized),
    },
  ];
  const missing = checks
    .filter((check) => !check.present)
    .map((check) => check.area);
  const warnings = [
    normalized.length > 1800
      ? "The prompt may hide its primary action; reduce secondary details."
      : "",
    (normalized.match(/\band\b|并且|同时/gi)?.length || 0) > 10
      ? "Many joined clauses may create competing actions or camera instructions."
      : "",
    !normalized
      ? "The prompt is empty. Start with one subject, one visible action, and one camera rule."
      : "",
  ].filter(Boolean);

  return {
    prompt: normalized,
    referenceTokens:
      normalized.match(/@(Image|Video|Audio)\d+|@(?:图片|视频|音频)\d+/gi) ||
      [],
    hasReferenceTokens: referenceTokenTerms.test(normalized),
    checks,
    missing,
    warnings,
    suggestions: missing.map((area) => `Add one concise ${area} instruction.`),
    nextStep:
      missing.length === 0
        ? "Test the prompt, then revise only one axis at a time."
        : "Add the missing controls before introducing more style language.",
  };
}
