// src/engine/gif/parseGif.ts
// ===============================================================
// GIF Decode -> PNG DataURLs
// - gifuct-js 기반
// - disposal 처리 포함 (2,3)
// - 결과: frames(dataURL[]), width, height, delays(ms[])
// ===============================================================

import * as Gifuct from "gifuct-js";

export type ParsedGif = {
  frames: string[];
  width: number;
  height: number;
  delays: number[]; // ms
};

function renderGifFrame(
  frame: any,
  canvas: HTMLCanvasElement,
  prevImageData: ImageData | null
) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;

  // disposalType:
  // 2: restore to background (clear)
  // 3: restore to previous
  if (frame.disposalType === 2) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  } else if (frame.disposalType === 3 && prevImageData) {
    ctx.putImageData(prevImageData, 0, 0);
  }

  // save current before applying this patch (for disposalType=3)
  const saved = ctx.getImageData(0, 0, canvas.width, canvas.height);

  // patch -> temp -> draw onto main canvas at dims
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = frame.dims.width;
  tempCanvas.height = frame.dims.height;
  const tempCtx = tempCanvas.getContext("2d")!;

  const imgData = tempCtx.createImageData(frame.dims.width, frame.dims.height);
  imgData.data.set(frame.patch);
  tempCtx.putImageData(imgData, 0, 0);

  ctx.drawImage(tempCanvas, frame.dims.left, frame.dims.top);

  const full = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return { full, saved };
}

export function parseGif(buffer: ArrayBuffer): ParsedGif {
  const gif = Gifuct.parseGIF(buffer);
  const frames = Gifuct.decompressFrames(gif, true);

  if (!frames || frames.length === 0) {
    throw new Error("GIF frames not found");
  }

  const width = gif.lsd.width;
  const height = gif.lsd.height;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.clearRect(0, 0, width, height);

  const frameDataURLs: string[] = [];
  const delays: number[] = [];

  let prevImage: ImageData | null = null;

  for (const frame of frames) {
    const { full, saved } = renderGifFrame(frame, canvas, prevImage);
    prevImage = saved;

    ctx.putImageData(full, 0, 0);
    frameDataURLs.push(canvas.toDataURL("image/png"));

    // gifuct delay is in 1/100s typically. 기존 로직 그대로 ms로 변환.
    const delay = (frame.delay || frame.delayTime || 10) * 10;
    delays.push(delay);
  }

  return { frames: frameDataURLs, width, height, delays };
}
