// src/engine/adjust.ts
// ===============================================================
// Image Adjust — SAFE IMPLEMENTATION
// brightness / contrast / saturation / gamma
// ===============================================================

import type { DitherSettings } from "../state/ditherSettings";

function clamp(v: number) {
  return v < 0 ? 0 : v > 255 ? 255 : v;
}

export function applyAdjust(
  src: ImageData,
  settings: DitherSettings
): ImageData {
  const out = new ImageData(src.width, src.height);

  const sd = src.data;
  const dd = out.data;



  // ---- params (정규화) ----
  const brightness = (settings.brightness ?? 0) / 100; // -1 ~ +1
  const contrast = (settings.contrast ?? 0) / 100;     // -1 ~ +1
  const saturation = (settings.saturation ?? 0) / 100; // -1 ~ +1
  const gamma = Math.max(0.01, (settings.gamma ?? 100) / 100); // >= 0.01

  for (let i = 0; i < sd.length; i += 4) {
    let r = sd[i];
    let g = sd[i + 1];
    let b = sd[i + 2];
    const a = sd[i + 3]; // alpha 보존

    // ---- brightness ----
    if (brightness !== 0) {
      r += 255 * brightness;
      g += 255 * brightness;
      b += 255 * brightness;
    }

    // ---- contrast ----
    if (contrast !== 0) {
      r = (r - 128) * (1 + contrast) + 128;
      g = (g - 128) * (1 + contrast) + 128;
      b = (b - 128) * (1 + contrast) + 128;
    }

    
  // ---- black / white point ----
const bp = settings.blackPoint ?? 0;
const wp = settings.whitePoint ?? 255;
const scale = 255 / Math.max(1, wp - bp);

r = clamp((r - bp) * scale);
g = clamp((g - bp) * scale);
b = clamp((b - bp) * scale);

// ---- grain ----
const grain = settings.grain ?? 0;
if (grain > 0) {
  const n = (Math.random() * 2 - 1) * grain;
  r = clamp(r + n);
  g = clamp(g + n);
  b = clamp(b + n);
}


    // ---- saturation ----
    if (saturation !== 0) {
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      r = gray + (r - gray) * (1 + saturation);
      g = gray + (g - gray) * (1 + saturation);
      b = gray + (b - gray) * (1 + saturation);
    }

    // ---- gamma (0~255 → 0~1 → pow → 0~255) ----
    if (gamma !== 1) {
      r = 255 * Math.pow(clamp(r) / 255, 1 / gamma);
      g = 255 * Math.pow(clamp(g) / 255, 1 / gamma);
      b = 255 * Math.pow(clamp(b) / 255, 1 / gamma);
    }

    // ---- write ----
    dd[i]     = clamp(r);
    dd[i + 1] = clamp(g);
    dd[i + 2] = clamp(b);
    dd[i + 3] = a === 0 ? 255 : a; // alpha 안전
  }

  return out;
}
