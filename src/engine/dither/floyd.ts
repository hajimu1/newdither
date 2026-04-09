// src/engine/dither/floyd.ts
// ===============================================================
// Error Diffusion Dithering Kernels
// - Floyd–Steinberg 포함 전 계열
// - Serpentine scan 적용
// - 순수 ImageData 계산 로직
// ===============================================================


const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

export type KernelOffset = {
  dx: number;
  dy: number;
  weight: number;
};

export type DiffusionKernel = {
  offsets: KernelOffset[];
};

/* ===============================================================
   Diffusion Kernels
=============================================================== */
export const DIFFUSION_KERNELS: Record<string, DiffusionKernel> = {
  floyd: {
    offsets: [
      { dx: 1, dy: 0, weight: 7 / 16 },
      { dx: -1, dy: 1, weight: 3 / 16 },
      { dx: 0, dy: 1, weight: 5 / 16 },
      { dx: 1, dy: 1, weight: 1 / 16 },
    ],
  },

  "false-floyd": {
    offsets: [
      { dx: 1, dy: 0, weight: 7 / 16 },
      { dx: 0, dy: 1, weight: 3 / 16 },
      { dx: 1, dy: 1, weight: 5 / 16 },
      { dx: 0, dy: 2, weight: 1 / 16 },
    ],
  },

  atkinson: {
    offsets: [
      { dx: 1, dy: 0, weight: 1 / 8 },
      { dx: 2, dy: 0, weight: 1 / 8 },
      { dx: -1, dy: 1, weight: 1 / 8 },
      { dx: 0, dy: 1, weight: 1 / 8 },
      { dx: 1, dy: 1, weight: 1 / 8 },
      { dx: 0, dy: 2, weight: 1 / 8 },
    ],
  },

  jarvis: {
    offsets: [
      { dx: 1, dy: 0, weight: 7 / 48 },
      { dx: 2, dy: 0, weight: 5 / 48 },
      { dx: -2, dy: 1, weight: 3 / 48 },
      { dx: -1, dy: 1, weight: 5 / 48 },
      { dx: 0, dy: 1, weight: 7 / 48 },
      { dx: 1, dy: 1, weight: 5 / 48 },
      { dx: 2, dy: 1, weight: 3 / 48 },
      { dx: -2, dy: 2, weight: 1 / 48 },
      { dx: -1, dy: 2, weight: 3 / 48 },
      { dx: 0, dy: 2, weight: 5 / 48 },
      { dx: 1, dy: 2, weight: 3 / 48 },
      { dx: 2, dy: 2, weight: 1 / 48 },
    ],
  },

  stucki: {
    offsets: [
      { dx: 1, dy: 0, weight: 8 / 42 },
      { dx: 2, dy: 0, weight: 4 / 42 },
      { dx: -2, dy: 1, weight: 2 / 42 },
      { dx: -1, dy: 1, weight: 4 / 42 },
      { dx: 0, dy: 1, weight: 8 / 42 },
      { dx: 1, dy: 1, weight: 4 / 42 },
      { dx: 2, dy: 1, weight: 2 / 42 },
      { dx: -2, dy: 2, weight: 1 / 42 },
      { dx: -1, dy: 2, weight: 2 / 42 },
      { dx: 0, dy: 2, weight: 4 / 42 },
      { dx: 1, dy: 2, weight: 2 / 42 },
      { dx: 2, dy: 2, weight: 1 / 42 },
    ],
  },

  burkes: {
    offsets: [
      { dx: 1, dy: 0, weight: 8 / 32 },
      { dx: 2, dy: 0, weight: 4 / 32 },
      { dx: -2, dy: 1, weight: 2 / 32 },
      { dx: -1, dy: 1, weight: 4 / 32 },
      { dx: 0, dy: 1, weight: 8 / 32 },
      { dx: 1, dy: 1, weight: 4 / 32 },
      { dx: 2, dy: 1, weight: 2 / 32 },
    ],
  },

  sierra: {
    offsets: [
      { dx: 1, dy: 0, weight: 5 / 32 },
      { dx: 2, dy: 0, weight: 3 / 32 },
      { dx: -2, dy: 1, weight: 2 / 32 },
      { dx: -1, dy: 1, weight: 4 / 32 },
      { dx: 0, dy: 1, weight: 5 / 32 },
      { dx: 1, dy: 1, weight: 4 / 32 },
      { dx: 2, dy: 1, weight: 2 / 32 },
      { dx: -1, dy: 2, weight: 2 / 32 },
      { dx: 0, dy: 2, weight: 3 / 32 },
      { dx: 1, dy: 2, weight: 2 / 32 },
    ],
  },

  "two-row-sierra": {
    offsets: [
      { dx: 1, dy: 0, weight: 4 / 16 },
      { dx: 2, dy: 0, weight: 3 / 16 },
      { dx: -2, dy: 1, weight: 1 / 16 },
      { dx: -1, dy: 1, weight: 2 / 16 },
      { dx: 0, dy: 1, weight: 3 / 16 },
      { dx: 1, dy: 1, weight: 2 / 16 },
      { dx: 2, dy: 1, weight: 1 / 16 },
    ],
  },

  "sierra-lite": {
    offsets: [
      { dx: 1, dy: 0, weight: 2 / 4 },
      { dx: -1, dy: 1, weight: 1 / 4 },
      { dx: 0, dy: 1, weight: 1 / 4 },
    ],
  },

  "stevenson-arce": {
    offsets: [
      { dx: 2, dy: 0, weight: 32 / 200 },
      { dx: -3, dy: 1, weight: 12 / 200 },
      { dx: -1, dy: 1, weight: 26 / 200 },
      { dx: 1, dy: 1, weight: 30 / 200 },
      { dx: 3, dy: 1, weight: 16 / 200 },
      { dx: -2, dy: 2, weight: 12 / 200 },
      { dx: 0, dy: 2, weight: 26 / 200 },
      { dx: 2, dy: 2, weight: 12 / 200 },
      { dx: -3, dy: 3, weight: 5 / 200 },
      { dx: -1, dy: 3, weight: 12 / 200 },
      { dx: 1, dy: 3, weight: 12 / 200 },
      { dx: 3, dy: 3, weight: 5 / 200 },
    ],
  },

  "shiau-fan": {
    offsets: [
      { dx: 1, dy: 0, weight: 4 / 16 },
      { dx: -1, dy: 1, weight: 2 / 16 },
      { dx: 0, dy: 1, weight: 3 / 16 },
      { dx: 1, dy: 1, weight: 2 / 16 },
      { dx: 2, dy: 1, weight: 1 / 16 },
    ],
  },

  "shiau-fan-2": {
    offsets: [
      { dx: 1, dy: 0, weight: 4 / 12 },
      { dx: -1, dy: 1, weight: 2 / 12 },
      { dx: 0, dy: 1, weight: 4 / 12 },
      { dx: 1, dy: 1, weight: 2 / 12 },
    ],
  },
};

/* ===============================================================
   Apply Error Diffusion
=============================================================== */
export function applyErrorDiffusion(
  imgData: ImageData,
  palette: number[][],
  kernel: DiffusionKernel
): ImageData {
  const { width: w, height: h, data } = imgData;

  // weight 정규화
  const total = kernel.offsets.reduce((a, o) => a + o.weight, 0);
  const offsets = kernel.offsets.map(o => ({
    dx: o.dx,
    dy: o.dy,
    weight: o.weight / total,
  }));

  for (let y = 0; y < h; y++) {
    const reverse = y % 2 === 1;
    const xs = reverse
      ? Array.from({ length: w }, (_, i) => w - 1 - i)
      : Array.from({ length: w }, (_, i) => i);

    for (const x of xs) {
      const i = (y * w + x) * 4;

      const oldR = data[i];
      const oldG = data[i + 1];
      const oldB = data[i + 2];

      // closest color
      let best = palette[0];
      let min = Infinity;
      for (const c of palette) {
        const d =
          (oldR - c[0]) ** 2 +
          (oldG - c[1]) ** 2 +
          (oldB - c[2]) ** 2;
        if (d < min) {
          min = d;
          best = c;
        }
      }

      const errR = oldR - best[0];
      const errG = oldG - best[1];
      const errB = oldB - best[2];

      data[i]     = best[0];
      data[i + 1] = best[1];
      data[i + 2] = best[2];

      for (const { dx, dy, weight } of offsets) {
        const nx = reverse ? x - dx : x + dx;
        const ny = y + dy;
        if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;

        const j = (ny * w + nx) * 4;
        data[j]     = clamp(data[j]     + errR * weight, 0, 255);
        data[j + 1] = clamp(data[j + 1] + errG * weight, 0, 255);
        data[j + 2] = clamp(data[j + 2] + errB * weight, 0, 255);
      }
    }
  }

  return imgData;
}
