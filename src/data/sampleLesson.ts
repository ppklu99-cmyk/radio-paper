import { buildChunks } from "../lib/chunks";
import type { Lesson } from "../lib/types";

const SAMPLE_TEXT =
  "Welcome to the midnight world desk. Tonight we follow a short briefing from the capital. Officials said talks will continue through the weekend. Markets opened mixed after the statement. We will return after this pause.";

const CREATED_AT = Date.UTC(2026, 7, 30);

export const SAMPLE_LESSON: Lesson = {
  id: "sample-desk-v2",
  title: "午夜世界台",
  durationSec: 18,
  mediaFileName: "desk.wav",
  createdAt: CREATED_AT,
};

export const SAMPLE_CHUNKS = buildChunks("sample-desk-v2", SAMPLE_TEXT, 18, CREATED_AT);
