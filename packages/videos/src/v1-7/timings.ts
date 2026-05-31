import { FOLDERS_SCENE_DURATION } from "./folders-scene";
import { READONLY_SCENE_DURATION } from "./readonly-scene";
import { RESUMABLE_SCENE_DURATION } from "./resumable-scene";
import { SYNC_SCENE_DURATION } from "./sync-scene";

export const FPS = 30;

const INTRO_DURATION = 90;
const OUTRO_DURATION = 75;

const INTRO_FROM = 0;
const RESUMABLE_FROM = INTRO_FROM + INTRO_DURATION;
const SYNC_FROM = RESUMABLE_FROM + RESUMABLE_SCENE_DURATION;
const FOLDERS_FROM = SYNC_FROM + SYNC_SCENE_DURATION;
const READONLY_FROM = FOLDERS_FROM + FOLDERS_SCENE_DURATION;
const OUTRO_FROM = READONLY_FROM + READONLY_SCENE_DURATION;

export const TIMING = {
  folders: { duration: FOLDERS_SCENE_DURATION, from: FOLDERS_FROM },
  intro: { duration: INTRO_DURATION, from: INTRO_FROM },
  outro: { duration: OUTRO_DURATION, from: OUTRO_FROM },
  readonly: { duration: READONLY_SCENE_DURATION, from: READONLY_FROM },
  resumable: { duration: RESUMABLE_SCENE_DURATION, from: RESUMABLE_FROM },
  sync: { duration: SYNC_SCENE_DURATION, from: SYNC_FROM },
} as const;

export const TOTAL_DURATION = OUTRO_FROM + OUTRO_DURATION;
