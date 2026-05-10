import { AI_SCENE_DURATION } from "./ai-scene";

export const FPS = 30;

const AI_FROM = 840;
const AI_END = AI_FROM + AI_SCENE_DURATION;
const OUTRO_DURATION = 60;

export const TIMING = {
  ai: { duration: AI_SCENE_DURATION, from: AI_FROM },
  code: { duration: 600, from: 90 },
  cycle: { duration: 150, from: 690 },
  install: { duration: 90, from: 0 },
  outro: { duration: OUTRO_DURATION, from: AI_END },
} as const;

export const TOTAL_DURATION = AI_END + OUTRO_DURATION;
