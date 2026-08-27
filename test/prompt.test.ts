import assert from "node:assert/strict";
import test from "node:test";

import { buildVideoPrompt, diagnosePrompt } from "../src/lib/prompt.js";
import { getChinaVideoResources } from "../src/lib/resources.js";
import { planReferenceShots } from "../src/lib/shots.js";

test("video prompt preserves workflow and reference constraints", () => {
  const result = buildVideoPrompt({
    idea: "A perfume bottle rises through a shallow pool",
    workflow: "image-to-video",
    durationSeconds: 8,
    aspectRatio: "9:16",
    camera: "slow push-in",
    referenceConstraints: "@Image1 bottle geometry and label text",
  });

  assert.equal(result.workflow, "image-to-video");
  assert.equal(result.outputLanguage, "en");
  assert.match(result.prompt, /slow push-in/);
  assert.match(result.prompt, /@Image1 bottle geometry and label text/);
});

test("video prompt automatically returns Chinese structure for a Chinese idea", () => {
  const result = buildVideoPrompt({ idea: "一只白鹭从清晨的湖面起飞" });

  assert.equal(result.outputLanguage, "zh");
  assert.match(result.prompt, /主体动作/);
  assert.match(result.prompt, /保持身份/);
});

test("reference shot planner creates bounded timed shots", () => {
  const result = planReferenceShots({
    idea: "A runner crosses a neon alley",
    shotCount: 3,
    totalDurationSeconds: 9,
    referenceRoles: "@Image1 controls identity; @Video1 controls motion",
  });

  assert.equal(result.shots.length, 3);
  assert.equal(result.shots[0]?.timing, "0-3s");
  assert.equal(result.shots[2]?.purpose, "Resolve");
  assert.match(result.referenceRoles, /@Video1/);
});

test("prompt diagnosis identifies missing controls and preserves reference tokens", () => {
  const result = diagnosePrompt("@Image1 A red robot in a city square");

  assert.ok(result.missing.includes("visible motion"));
  assert.ok(result.missing.includes("camera direction"));
  assert.deepEqual(result.referenceTokens, ["@Image1"]);
});

test("resources use the configured canonical origin", () => {
  const result = getChinaVideoResources(
    "https://chinavideoai.com",
    "prompting",
  );

  assert.ok(result.length >= 2);
  assert.ok(
    result.every((item) => item.url.startsWith("https://chinavideoai.com/")),
  );
});
