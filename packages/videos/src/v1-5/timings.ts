import { BULK_SCENE_DURATION } from "./bulk-scene";
import { CONVEX_SCENE_DURATION } from "./convex-scene";
import { FTP_SCENE_DURATION } from "./ftp-scene";

export const FPS = 30;

const INTRO_DURATION = 90;
const OUTRO_DURATION = 75;

const INTRO_FROM = 0;
const BULK_FROM = INTRO_FROM + INTRO_DURATION;
const FTP_FROM = BULK_FROM + BULK_SCENE_DURATION;
const CONVEX_FROM = FTP_FROM + FTP_SCENE_DURATION;
const OUTRO_FROM = CONVEX_FROM + CONVEX_SCENE_DURATION;

export const TIMING = {
  bulk: { duration: BULK_SCENE_DURATION, from: BULK_FROM },
  convex: { duration: CONVEX_SCENE_DURATION, from: CONVEX_FROM },
  ftp: { duration: FTP_SCENE_DURATION, from: FTP_FROM },
  intro: { duration: INTRO_DURATION, from: INTRO_FROM },
  outro: { duration: OUTRO_DURATION, from: OUTRO_FROM },
} as const;

export const TOTAL_DURATION = OUTRO_FROM + OUTRO_DURATION;
