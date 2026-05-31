import { HOOKS_SCENE_DURATION } from "./hooks-scene";
import { MEMORY_SCENE_DURATION } from "./memory-scene";
import { METHODS_SCENE_DURATION } from "./methods-scene";
import { MULTIPART_SCENE_DURATION } from "./multipart-scene";
import { PROGRESS_SCENE_DURATION } from "./progress-scene";
import { RANGE_SCENE_DURATION } from "./range-scene";
import { TRANSFER_SCENE_DURATION } from "./transfer-scene";

export const FPS = 30;

const INTRO_DURATION = 90;
const OUTRO_DURATION = 75;

const INTRO_FROM = 0;
const HOOKS_FROM = INTRO_FROM + INTRO_DURATION;
const PROGRESS_FROM = HOOKS_FROM + HOOKS_SCENE_DURATION;
const METHODS_FROM = PROGRESS_FROM + PROGRESS_SCENE_DURATION;
const TRANSFER_FROM = METHODS_FROM + METHODS_SCENE_DURATION;
const MEMORY_FROM = TRANSFER_FROM + TRANSFER_SCENE_DURATION;
const MULTIPART_FROM = MEMORY_FROM + MEMORY_SCENE_DURATION;
const RANGE_FROM = MULTIPART_FROM + MULTIPART_SCENE_DURATION;
const OUTRO_FROM = RANGE_FROM + RANGE_SCENE_DURATION;

export const TIMING = {
  hooks: { duration: HOOKS_SCENE_DURATION, from: HOOKS_FROM },
  intro: { duration: INTRO_DURATION, from: INTRO_FROM },
  memory: { duration: MEMORY_SCENE_DURATION, from: MEMORY_FROM },
  methods: { duration: METHODS_SCENE_DURATION, from: METHODS_FROM },
  multipart: { duration: MULTIPART_SCENE_DURATION, from: MULTIPART_FROM },
  outro: { duration: OUTRO_DURATION, from: OUTRO_FROM },
  progress: { duration: PROGRESS_SCENE_DURATION, from: PROGRESS_FROM },
  range: { duration: RANGE_SCENE_DURATION, from: RANGE_FROM },
  transfer: { duration: TRANSFER_SCENE_DURATION, from: TRANSFER_FROM },
} as const;

export const TOTAL_DURATION = OUTRO_FROM + OUTRO_DURATION;
