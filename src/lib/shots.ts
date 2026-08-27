export type PlanReferenceShotsParams = {
  idea: string;
  shotCount?: number | undefined;
  totalDurationSeconds?: number | undefined;
  continuityAnchor?: string | undefined;
  cameraStyle?: string | undefined;
  referenceRoles?: string | undefined;
};

const phases = [
  {
    purpose: "Establish",
    direction:
      "Introduce the subject, environment, scale, and screen direction clearly.",
  },
  {
    purpose: "Initiate motion",
    direction:
      "Begin one readable subject action without changing identity or geography.",
  },
  {
    purpose: "Develop",
    direction:
      "Continue the action with one motivated change in framing or distance.",
  },
  {
    purpose: "Detail",
    direction:
      "Show one useful close detail while preserving lighting and spatial continuity.",
  },
  {
    purpose: "Resolve",
    direction: "Complete the action and hold a clean, stable end frame.",
  },
] as const;

function clean(value: string | undefined) {
  return (value || "").replace(/\s+/g, " ").trim();
}

export function planReferenceShots(params: PlanReferenceShotsParams) {
  const idea = clean(params.idea);
  const shotCount = Math.min(Math.max(params.shotCount || 3, 1), 6);
  const totalDurationSeconds = Math.min(
    Math.max(params.totalDurationSeconds || shotCount * 3, shotCount),
    120,
  );
  const continuityAnchor =
    clean(params.continuityAnchor) ||
    "subject identity, wardrobe or product geometry, lighting, and screen direction";
  const cameraStyle = clean(params.cameraStyle) || "stable cinematic framing";
  const referenceRoles =
    clean(params.referenceRoles) ||
    "State what each @Image, @Video, or @Audio reference controls; preserve the token labels exactly.";
  const secondsPerShot = totalDurationSeconds / shotCount;

  const selectedPhases: Array<{ purpose: string; direction: string }> =
    Array.from({ length: shotCount }, (_, index) => {
      if (shotCount === 1) {
        return {
          purpose: "Single continuous shot",
          direction:
            "Establish, develop, and resolve one action without a cut.",
        };
      }
      if (index === shotCount - 1) return phases[phases.length - 1]!;
      const phaseIndex = Math.min(index, phases.length - 2);
      return phases[phaseIndex]!;
    });

  const shots = selectedPhases.map((phase, index) => {
    const start = Number((index * secondsPerShot).toFixed(1));
    const end = Number(((index + 1) * secondsPerShot).toFixed(1));
    return {
      shot: index + 1,
      timing: `${start}-${end}s`,
      purpose: phase.purpose,
      direction: phase.direction,
      camera: cameraStyle,
      continuity: `Preserve ${continuityAnchor}.`,
      endFrame:
        index === shotCount - 1
          ? "Hold a clean final composition."
          : "End on a stable frame that can anchor the next shot.",
    };
  });

  return {
    idea,
    shotCount,
    totalDurationSeconds,
    continuityAnchor,
    cameraStyle,
    referenceRoles,
    shots,
    assemblyNote:
      "Keep each shot to one purpose and one action. Use the final frame of each shot as the visual anchor for the next.",
  };
}
