// src/engine/resize.ts
// ===============================================================
// Pixel grid downsample / upscale (SAFE VERSION)
// ===============================================================

export function downsamplePixelGrid(
  src: ImageData,
  pixelSize: number
): ImageData {
  const sw = src.width;
  const sh = src.height;

  const dw = Math.floor(sw / pixelSize);
  const dh = Math.floor(sh / pixelSize);

  const out = new ImageData(dw, dh);
  const sd = src.data;
  const dd = out.data;

  for (let y = 0; y < dh; y++) {
    for (let x = 0; x < dw; x++) {
      // 샘플링: 블록 좌상단
      const sx = x * pixelSize;
      const sy = y * pixelSize;
      const si = (sy * sw + sx) * 4;

      const di = (y * dw + x) * 4;

      dd[di]     = sd[si];     // R
      dd[di + 1] = sd[si + 1]; // G
      dd[di + 2] = sd[si + 2]; // B
      dd[di + 3] = 255;        // A (고정)
    }
  }

  return out;
}

export function upscalePixelGrid(
  src: ImageData,
  pixelSize: number
): ImageData {
  const sw = src.width;
  const sh = src.height;

  const dw = sw * pixelSize;
  const dh = sh * pixelSize;

  const out = new ImageData(dw, dh);
  const sd = src.data;
  const dd = out.data;

  for (let y = 0; y < dh; y++) {
    for (let x = 0; x < dw; x++) {
      const sx = Math.floor(x / pixelSize);
      const sy = Math.floor(y / pixelSize);

      const si = (sy * sw + sx) * 4;
      const di = (y * dw + x) * 4;

      dd[di]     = sd[si];
      dd[di + 1] = sd[si + 1];
      dd[di + 2] = sd[si + 2];
      dd[di + 3] = 255;
    }
  }

  return out;
}
