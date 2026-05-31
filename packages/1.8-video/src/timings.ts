import { COMPRESSION_SCENE_DURATION } from "./compression-scene";
import { CONTENT_TYPE_SCENE_DURATION } from "./content-type-scene";
import { DEDUP_SCENE_DURATION } from "./dedup-scene";
import { ENCRYPTION_SCENE_DURATION } from "./encryption-scene";
import { GALLERY_SCENE_DURATION } from "./gallery-scene";
import { SEARCH_SCENE_DURATION } from "./search-scene";
import { TRACING_SCENE_DURATION } from "./tracing-scene";
import { USAGE_SCENE_DURATION } from "./usage-scene";
import { VALIDATION_SCENE_DURATION } from "./validation-scene";
import { VERSIONING_SCENE_DURATION } from "./versioning-scene";

export const FPS = 30;

const INTRO_DURATION = 90;
const OUTRO_DURATION = 75;

const INTRO_FROM = 0;
const SEARCH_FROM = INTRO_FROM + INTRO_DURATION;
const GALLERY_FROM = SEARCH_FROM + SEARCH_SCENE_DURATION;
const ENCRYPTION_FROM = GALLERY_FROM + GALLERY_SCENE_DURATION;
const COMPRESSION_FROM = ENCRYPTION_FROM + ENCRYPTION_SCENE_DURATION;
const CONTENT_TYPE_FROM = COMPRESSION_FROM + COMPRESSION_SCENE_DURATION;
const DEDUP_FROM = CONTENT_TYPE_FROM + CONTENT_TYPE_SCENE_DURATION;
const USAGE_FROM = DEDUP_FROM + DEDUP_SCENE_DURATION;
const VALIDATION_FROM = USAGE_FROM + USAGE_SCENE_DURATION;
const VERSIONING_FROM = VALIDATION_FROM + VALIDATION_SCENE_DURATION;
const TRACING_FROM = VERSIONING_FROM + VERSIONING_SCENE_DURATION;
const OUTRO_FROM = TRACING_FROM + TRACING_SCENE_DURATION;

export const TIMING = {
  compression: { duration: COMPRESSION_SCENE_DURATION, from: COMPRESSION_FROM },
  contentType: {
    duration: CONTENT_TYPE_SCENE_DURATION,
    from: CONTENT_TYPE_FROM,
  },
  dedup: { duration: DEDUP_SCENE_DURATION, from: DEDUP_FROM },
  encryption: { duration: ENCRYPTION_SCENE_DURATION, from: ENCRYPTION_FROM },
  gallery: { duration: GALLERY_SCENE_DURATION, from: GALLERY_FROM },
  intro: { duration: INTRO_DURATION, from: INTRO_FROM },
  outro: { duration: OUTRO_DURATION, from: OUTRO_FROM },
  search: { duration: SEARCH_SCENE_DURATION, from: SEARCH_FROM },
  tracing: { duration: TRACING_SCENE_DURATION, from: TRACING_FROM },
  usage: { duration: USAGE_SCENE_DURATION, from: USAGE_FROM },
  validation: { duration: VALIDATION_SCENE_DURATION, from: VALIDATION_FROM },
  versioning: { duration: VERSIONING_SCENE_DURATION, from: VERSIONING_FROM },
} as const;

export const TOTAL_DURATION = OUTRO_FROM + OUTRO_DURATION;
