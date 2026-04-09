// src/engine/dither/noise.ts
const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

export function makeIGN(x: number, y: number) {
  // Interleaved Gradient Noise (IGN)
  return ((x * 0.06711056 + y * 0.00583715) % 1) - 0.5;
}

export function applyIGN(
  imgData: ImageData,
  palette: number[][],
  strength: number
): ImageData {
  const { width: w, height: h, data } = imgData;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;

      const n = makeIGN(x, y) * strength;

      const rr = clamp(data[i] + n, 0, 255);
      const gg = clamp(data[i + 1] + n, 0, 255);
      const bb = clamp(data[i + 2] + n, 0, 255);

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

function hash(x: number, y: number) {
  return ((x * 374761393 + y * 668265263) ^ (x << 13)) >>> 0;
}

export function applyValueNoise(
  imgData: ImageData,
  palette: number[][],
  strength: number
): ImageData {
  const { width: w, height: h, data } = imgData;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const n = ((hash(x, y) % 1024) / 1024 - 0.5) * strength;

      const rr = clamp(data[i] + n, 0, 255);
      const gg = clamp(data[i + 1] + n, 0, 255);
      const bb = clamp(data[i + 2] + n, 0, 255);

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
