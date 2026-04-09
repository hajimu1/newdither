// src/engine/dither/dotLine.ts
const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

/* ===============================================================
   Dot Diffusion (Improved / True-ish)
=============================================================== */
/*
  - 4x4 class matrix
  - class 순서대로 처리
  - 에러는 "아직 처리되지 않은 클래스" 방향으로만 확산
*/
const DOT_CLASS = [
  [0,  8,  2, 10],
  [12, 4, 14, 6 ],
  [3, 11, 1,  9 ],
  [15, 7, 13, 5 ],
];

// Dot Diffusion용 이웃 (논문 계열 단순화)
const DOT_NEIGHBORS = [
  { dx:  1, dy:  0, w: 1 / 8 },
  { dx: -1, dy:  0, w: 1 / 8 },
  { dx:  0, dy:  1, w: 1 / 8 },
  { dx:  0, dy: -1, w: 1 / 8 },
  { dx:  1, dy:  1, w: 1 / 8 },
  { dx: -1, dy:  1, w: 1 / 8 },
  { dx:  1, dy: -1, w: 1 / 8 },
  { dx: -1, dy: -1, w: 1 / 8 },
];

export function dotDiffusion(
  imgData: ImageData,
  palette: number[][]
): ImageData {
  const { width: w, height: h, data } = imgData;
  const size = DOT_CLASS.length;
  const maxClass = size * size;

  // 클래스 단계별 처리
  for (let cls = 0; cls < maxClass; cls++) {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (DOT_CLASS[y % size][x % size] !== cls) continue;

        const i = (y * w + x) * 4;
        const old =
          (data[i] + data[i + 1] + data[i + 2]) / 3;

        // 가장 가까운 팔레트 색
        let best = palette[0];
        let min = Infinity;
        for (const col of palette) {
          const d = (old - col[0]) ** 2;
          if (d < min) {
            min = d;
            best = col;
          }
        }

        const err = old - best[0];

        // 현재 픽셀 확정
        data[i]     = best[0];
        data[i + 1] = best[1];
        data[i + 2] = best[2];
        data[i + 3] = 255;

        // 에러 확산: "아직 처리 안 된 클래스"에게만
        for (const n of DOT_NEIGHBORS) {
          const nx = x + n.dx;
          const ny = y + n.dy;
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;

          const nClass = DOT_CLASS[ny % size][nx % size];
          if (nClass <= cls) continue; // 이미 처리된 클래스는 건너뜀

          const j = (ny * w + nx) * 4;
          data[j]     = clamp(data[j]     + err * n.w, 0, 255);
          data[j + 1] = clamp(data[j + 1] + err * n.w, 0, 255);
          data[j + 2] = clamp(data[j + 2] + err * n.w, 0, 255);
        }
      }
    }
  }

  return imgData;
}

/* ===============================================================
   Line Diffusion (Color)
=============================================================== */
/*
  한 줄 단위 누적 확산
  → RGB 각각 에러를 다음 줄로 전달
  → Dot과 대비되는 "흐름" 질감 유지
*/
export function lineDiffusion(
  imgData: ImageData,
  palette: number[][]
): ImageData {
  const { width: w, height: h, data } = imgData;

  // 줄 간 에러 버퍼 (RGB 분리)
  let lineErrR = new Float32Array(w).fill(0);
  let lineErrG = new Float32Array(w).fill(0);
  let lineErrB = new Float32Array(w).fill(0);

  for (let y = 0; y < h; y++) {
    const reverse = y % 2 === 1;
    const xs = reverse
      ? Array.from({ length: w }, (_, i) => w - 1 - i)
      : Array.from({ length: w }, (_, i) => i);

    const nextErrR = new Float32Array(w).fill(0);
    const nextErrG = new Float32Array(w).fill(0);
    const nextErrB = new Float32Array(w).fill(0);

    for (const x of xs) {
      const i = (y * w + x) * 4;

      const oldR = clamp(data[i] + lineErrR[x], 0, 255);
      const oldG = clamp(data[i + 1] + lineErrG[x], 0, 255);
      const oldB = clamp(data[i + 2] + lineErrB[x], 0, 255);

      // 가장 가까운 팔레트 색 (RGB 거리)
      let best = palette[0];
      let min = Infinity;

      for (const col of palette) {
        const dr = oldR - col[0];
        const dg = oldG - col[1];
        const db = oldB - col[2];
        const d = dr * dr + dg * dg + db * db;

        if (d < min) {
          min = d;
          best = col;
        }
      }

      const errR = oldR - best[0];
      const errG = oldG - best[1];
      const errB = oldB - best[2];

      data[i]     = best[0];
      data[i + 1] = best[1];
      data[i + 2] = best[2];
      data[i + 3] = 255;

      // ↓↓↓ 핵심: 에러를 "다음 줄"에 RGB 각각 넘김
      if (x > 0) {
        nextErrR[x - 1] += errR * 0.25;
        nextErrG[x - 1] += errG * 0.25;
        nextErrB[x - 1] += errB * 0.25;
      }

      nextErrR[x] += errR * 0.5;
      nextErrG[x] += errG * 0.5;
      nextErrB[x] += errB * 0.5;

      if (x < w - 1) {
        nextErrR[x + 1] += errR * 0.25;
        nextErrG[x + 1] += errG * 0.25;
        nextErrB[x + 1] += errB * 0.25;
      }
    }

    lineErrR = nextErrR;
    lineErrG = nextErrG;
    lineErrB = nextErrB;
  }

  return imgData;
}