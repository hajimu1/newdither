// src/engine/dither/index.ts
// ===============================================================
// Dither Dispatcher
// - threshold / random / blue-noise
// - ordered dither (Bayer / Cluster / etc)
// - error diffusion 연결 (floyd.ts)
// ===============================================================

import { applyErrorDiffusion, DIFFUSION_KERNELS } from "./floyd";
import { ORDERED_MAP, applyOrdered } from "./ordered";
import { applyIGN, applyValueNoise } from "./noise";
import { dotDiffusion, lineDiffusion } from "./dotLine";
import { adaptiveThreshold, meanThreshold } from "./threshold";

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

type Matrix = number[][];

/* ===============================================================
   Ordered Dither Matrices (legacy inline)
=============================================================== */
const bayer2: Matrix = [
  [0, 2],
  [3, 1],
];

const bayer4: Matrix = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

const bayer8: Matrix = (() => {
  const base = bayer4;
  const m: number[][] = Array.from({ length: 8 }, () => Array(8).fill(0));
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      const v = base[y][x];
      m[y][x] = 4 * v;
      m[y][x + 4] = 4 * v + 2;
      m[y + 4][x] = 4 * v + 3;
      m[y + 4][x + 4] = 4 * v + 1;
    }
  }
  return m;
})();

const bayer16: Matrix = (() => {
  const base = bayer8;
  const m: number[][] = Array.from({ length: 16 }, () => Array(16).fill(0));
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const v = base[y][x];
      m[y][x] = 4 * v;
      m[y][x + 8] = 4 * v + 2;
      m[y + 8][x] = 4 * v + 3;
      m[y + 8][x + 8] = 4 * v + 1;
    }
  }
  return m;
})();

const clustered4: Matrix = [
  [12, 5, 6, 13],
  [4, 0, 1, 7],
  [11, 3, 2, 8],
  [15, 10, 9, 14],
];

const diagonal8: Matrix = [
  [0, 48, 12, 60, 3, 51, 15, 63],
  [32, 16, 44, 28, 35, 19, 47, 31],
  [8, 56, 4, 52, 11, 59, 7, 55],
  [40, 24, 36, 20, 43, 27, 39, 23],
  [2, 50, 14, 62, 1, 49, 13, 61],
  [34, 18, 46, 30, 33, 17, 45, 29],
  [10, 58, 6, 54, 9, 57, 5, 53],
  [42, 26, 38, 22, 41, 25, 37, 21],
];

/* ===============================================================
   Legacy Ordered Dither (inline)
=============================================================== */

function applyOrderedDither(
  imgData: ImageData,
  palette: number[][],
  matrix: Matrix,
  strength: number
): ImageData {
  const { width: w, height: h, data } = imgData;
  const n = matrix.length;
  const maxVal = n * n - 1 || 1;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;

      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const m = matrix[y % n][x % n];
      const t = (m / maxVal - 0.5) * strength;

      const rr = clamp(r + t, 0, 255);
      const gg = clamp(g + t, 0, 255);
      const bb = clamp(b + t, 0, 255);

      let best = palette[0];
      let min = Infinity;

      for (const c of palette) {
        const dr = rr - c[0];
        const dg = gg - c[1];
        const db = bb - c[2];
        const d = dr * dr + dg * dg + db * db;

        if (d < min) {
          min = d;
          best = c;
        }
      }

      data[i] = best[0];
      data[i + 1] = best[1];
      data[i + 2] = best[2];
      data[i + 3] = 255;
    }
  }

  return imgData;
}

/* ===============================================================
   Noise (blue-noise quick)
=============================================================== */
function makeBlueNoise(w: number, h: number, strength: number) {
  const arr = new Float32Array(w * h);
  for (let i = 0; i < arr.length; i++) {
    arr[i] = (Math.random() - 0.5) * strength;
  }
  return arr;
}

/* ===============================================================
   Main Dither Dispatcher
=============================================================== */
export function dither(
  imgData: ImageData,
  palette: number[][],
  mode: string,
  threshold: number
): ImageData {
  const { width: w, height: h, data } = imgData;

  // threshold bias (global)
  if (threshold !== 128) {
    const t = threshold - 128;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = clamp(data[i] + t, 0, 255);
      data[i + 1] = clamp(data[i + 1] + t, 0, 255);
      data[i + 2] = clamp(data[i + 2] + t, 0, 255);
    }
  }

  // ============================================================
  // 0) Special modes (MUST be above DIFFUSION / ORDERED)
  // ============================================================
  if (mode === "dot-diffusion") {
    return dotDiffusion(imgData, palette);
  }

  if (mode === "line-diffusion") {
    return lineDiffusion(imgData, palette);
  }

  // ============================================================
  // 1) Threshold family
  // ============================================================
  if (mode === "threshold") {
    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      const c = avg > threshold ? palette[palette.length - 1] : palette[0];
      data[i] = c[0];
      data[i + 1] = c[1];
      data[i + 2] = c[2];
      data[i + 3] = 255;
    }
    return imgData;
  }

  if (mode === "adaptive-threshold") {
    return adaptiveThreshold(imgData, palette);
  }

  if (mode === "mean-threshold") {
    return meanThreshold(imgData, palette);
  }

  // ============================================================
  // 2) Noise family
  // ============================================================
  if (mode === "random" || mode === "white-noise") {
    for (let i = 0; i < data.length; i += 4) {
      const n = (Math.random() - 0.5) * threshold;
      const c = palette.reduce((best, cur) => {
        const d =
          (data[i] + n - cur[0]) ** 2 +
          (data[i + 1] + n - cur[1]) ** 2 +
          (data[i + 2] + n - cur[2]) ** 2;
        return d <
          (data[i] - best[0]) ** 2 +
            (data[i + 1] - best[1]) ** 2 +
            (data[i + 2] - best[2]) ** 2
          ? cur
          : best;
      }, palette[0]);

      data[i] = c[0];
      data[i + 1] = c[1];
      data[i + 2] = c[2];
      data[i + 3] = 255;
    }
    return imgData;
  }

  if (mode === "blue-noise") {
    const blue = makeBlueNoise(w, h, threshold || 64);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        const n = blue[y * w + x];
        const c = palette.reduce((best, cur) => {
          const d =
            (data[i] + n - cur[0]) ** 2 +
            (data[i + 1] + n - cur[1]) ** 2 +
            (data[i + 2] + n - cur[2]) ** 2;
          return d <
            (data[i] - best[0]) ** 2 +
              (data[i + 1] - best[1]) ** 2 +
              (data[i + 2] - best[2]) ** 2
            ? cur
            : best;
        }, palette[0]);

        data[i] = c[0];
        data[i + 1] = c[1];
        data[i + 2] = c[2];
        data[i + 3] = 255;
      }
    }
    return imgData;
  }

  if (mode === "ign") {
    return applyIGN(imgData, palette, threshold || 64);
  }

  if (mode === "value-noise") {
    return applyValueNoise(imgData, palette, threshold || 64);
  }
  if (mode === "ordered-noise") {
    const tmp = applyIGN(imgData, palette, threshold * 0.5);
    return applyOrdered(
      tmp,
      palette,
      ORDERED_MAP["bayer-4-shift"], // ✅ 이걸로 교체
      threshold * 0.75
    );
  }
  
  // ============================================================
  // 3) Ordered family (legacy inline + new ORDERED_MAP)
  // ============================================================
  const legacyOrderedMap: Record<string, Matrix> = {
    "bayer-2": bayer2,
    "bayer-4": bayer4,
    "bayer-8": bayer8,
    "bayer-16": bayer16,
    "cluster-4": clustered4,
    "diag-8": diagonal8,
  };

  if (mode in legacyOrderedMap) {
    return applyOrderedDither(imgData, palette, legacyOrderedMap[mode], threshold);
  }

  if (mode in ORDERED_MAP) {
    return applyOrdered(imgData, palette, ORDERED_MAP[mode], threshold);
  }

  // ============================================================
  // 4) Error diffusion family (floyd kernels)
  // ============================================================
  if (mode in DIFFUSION_KERNELS) {
    return applyErrorDiffusion(imgData, palette, DIFFUSION_KERNELS[mode]);
  }

  // fallback
  return applyErrorDiffusion(imgData, palette, DIFFUSION_KERNELS["floyd"]);
}
