// src/engine/dither/ordered.ts
type Matrix = number[][];

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

export function applyOrdered(
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
   ORDERED MAP (extended)
=============================================================== */
export const ORDERED_MAP: Record<string, Matrix> = {
  // -------------------------------
  // Bayer variants
  // -------------------------------
  "bayer-3": [
    [0, 7, 3],
    [6, 5, 2],
    [4, 1, 8],
  ],

  "bayer-4-shift": [
    [4, 14, 6, 12],
    [11, 1, 9, 3],
    [15, 5, 13, 7],
    [8, 10, 2, 0],
  ],

  // -------------------------------
  // Clustered dot (medium)
  // -------------------------------
  "cluster-6": [
    [24, 10, 12, 26, 28, 14],
    [ 9,  0,  2, 16, 18, 30],
    [11,  3,  1, 13, 15, 27],
    [25, 17, 19, 31, 29, 21],
    [23,  8,  6, 20, 22, 32],
    [ 7,  5,  4, 34, 33, 35],
  ],

  // -------------------------------
  // Clustered dot (large / coarse)
  // -------------------------------
  "cluster-8": [
    [48,20,22,50,52,24,26,54],
    [19, 0, 2,16,18,32,34,56],
    [21, 3, 1,17,15,33,31,55],
    [49,35,37,51,53,39,41,57],
    [47,14,12,28,30,46,44,60],
    [13, 5, 7,29,27,45,43,59],
    [11, 9, 8,36,38,42,40,58],
    [63,61,62,64,65,66,67,68],
  ],

  // -------------------------------
  // Void-and-cluster style (experimental)
  // - 중심부 공백 강조
  // - 필름 / CRT / 거친 톤에 좋음
  // -------------------------------
  "void-cluster-8": [
    [63,62,61,60,59,58,57,56],
    [55,40,39,38,37,36,35,54],
    [53,34,21,20,19,18,33,52],
    [51,32,17, 4, 3,16,31,50],
    [49,30,15, 2, 1,14,29,48],
    [47,28,13,12,11,10,27,46],
    [45,26,25,24,23,22,41,44],
    [43,42,41,40,39,38,37,36],
  ],
};