// src/engine/gif/processGif.ts
// ===============================================================
// Process ALL frames (중요: Promise.all로 "첫 프레임만" 버그 방지)
// ===============================================================

export async function processGifFrames(
  frames: string[],
  processImage: (src: string) => Promise<string | null>
): Promise<string[]> {
  if (!frames || frames.length === 0) return [];

  const tasks = frames.map(async (url) => {
    const out = await processImage(url);
    return out || null;
  });

  const results = await Promise.all(tasks);
  return results.filter((v): v is string => typeof v === "string");
}

