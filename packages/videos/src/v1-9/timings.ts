import { AUDIT_SCENE_DURATION } from "./audit-scene";
import { CACHE_SCENE_DURATION } from "./cache-scene";
import { FAILOVER_SCENE_DURATION } from "./failover-scene";
import { GALLERY_SCENE_DURATION } from "./gallery-scene";
import { NEON_SCENE_DURATION } from "./neon-scene";
import { SIGNED_URL_SCENE_DURATION } from "./signed-url-scene";
import { SOFT_DELETE_SCENE_DURATION } from "./soft-delete-scene";
import { TIERING_SCENE_DURATION } from "./tiering-scene";
import { ZIP_SCENE_DURATION } from "./zip-scene";

export const FPS = 30;

const INTRO_DURATION = 110;
const OUTRO_DURATION = 75;

const INTRO_FROM = 0;
const NEON_FROM = INTRO_FROM + INTRO_DURATION;
const GALLERY_FROM = NEON_FROM + NEON_SCENE_DURATION;
const SOFT_DELETE_FROM = GALLERY_FROM + GALLERY_SCENE_DURATION;
const TIERING_FROM = SOFT_DELETE_FROM + SOFT_DELETE_SCENE_DURATION;
const FAILOVER_FROM = TIERING_FROM + TIERING_SCENE_DURATION;
const CACHE_FROM = FAILOVER_FROM + FAILOVER_SCENE_DURATION;
const AUDIT_FROM = CACHE_FROM + CACHE_SCENE_DURATION;
const SIGNED_URL_FROM = AUDIT_FROM + AUDIT_SCENE_DURATION;
const ZIP_FROM = SIGNED_URL_FROM + SIGNED_URL_SCENE_DURATION;
const OUTRO_FROM = ZIP_FROM + ZIP_SCENE_DURATION;

export const TIMING = {
  audit: { duration: AUDIT_SCENE_DURATION, from: AUDIT_FROM },
  cache: { duration: CACHE_SCENE_DURATION, from: CACHE_FROM },
  failover: { duration: FAILOVER_SCENE_DURATION, from: FAILOVER_FROM },
  gallery: { duration: GALLERY_SCENE_DURATION, from: GALLERY_FROM },
  intro: { duration: INTRO_DURATION, from: INTRO_FROM },
  neon: { duration: NEON_SCENE_DURATION, from: NEON_FROM },
  outro: { duration: OUTRO_DURATION, from: OUTRO_FROM },
  signedUrl: { duration: SIGNED_URL_SCENE_DURATION, from: SIGNED_URL_FROM },
  softDelete: { duration: SOFT_DELETE_SCENE_DURATION, from: SOFT_DELETE_FROM },
  tiering: { duration: TIERING_SCENE_DURATION, from: TIERING_FROM },
  zip: { duration: ZIP_SCENE_DURATION, from: ZIP_FROM },
} as const;

export const TOTAL_DURATION = OUTRO_FROM + OUTRO_DURATION;
