import framework from "./framework.json";

// IDs are stable data identifiers, not translated labels.
export type PillarId = "human-social-cognition" | "human-inspired-modelling" | "robotic-simulation-interaction";
export const researchFramework = framework as Omit<typeof framework, "pillars"> & { pillars: (Omit<(typeof framework.pillars)[number], "id"> & { id: PillarId })[] };
