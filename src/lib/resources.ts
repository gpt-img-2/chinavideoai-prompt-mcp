export type ResourceTopic =
  | "all"
  | "prompting"
  | "workflows"
  | "models"
  | "safety";

const resources = [
  {
    topic: "prompting",
    title: "Seedance 2.5 Reference-to-Video Guide",
    path: "/blog/seedance-25-reference-to-video-guide",
    purpose:
      "Reference roles, continuity anchors, motion direction, and prompt iteration.",
  },
  {
    topic: "prompting",
    title: "Seedance 2.5 Image-to-Video Prompt Workflow",
    path: "/blog/seedance-25-image-to-video-prompt-workflow",
    purpose:
      "A practical image-to-video prompt workflow with observable constraints.",
  },
  {
    topic: "workflows",
    title: "China AI Video Generator",
    path: "/china-ai-video-generator",
    purpose: "Start a China AI video generation workflow.",
  },
  {
    topic: "workflows",
    title: "Text to Video",
    path: "/text-to-video",
    purpose: "Create video instructions from a text concept.",
  },
  {
    topic: "workflows",
    title: "Image to Video",
    path: "/image-to-video",
    purpose: "Animate reference images while preserving visual anchors.",
  },
  {
    topic: "workflows",
    title: "Video to Video",
    path: "/video-to-video",
    purpose:
      "Transform source footage while preserving chosen motion and timing.",
  },
  {
    topic: "models",
    title: "Chinese AI Video Models",
    path: "/chinese-ai-video-models",
    purpose: "Orient users across China-developed AI video model families.",
  },
  {
    topic: "models",
    title: "China Seedance",
    path: "/china-seedance",
    purpose: "Seedance-oriented workflows and product guidance.",
  },
  {
    topic: "safety",
    title: "Acceptable Use Policy — AI Content",
    path: "/acceptable-use-policy",
    purpose: "Responsible use requirements for AI-generated content.",
  },
] as const;

export function getChinaVideoResources(
  appBaseUrl: string,
  topic: ResourceTopic,
) {
  return resources
    .filter((resource) => topic === "all" || resource.topic === topic)
    .map((resource) => ({
      ...resource,
      url: `${appBaseUrl}${resource.path}`,
    }));
}
