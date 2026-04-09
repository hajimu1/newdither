// src/engine/gif/exportZip.ts
// ===============================================================
// Export PNG frames -> ZIP download
// ===============================================================

import JSZip from "jszip";

function dataURLtoBlob(dataurl: string) {
  const parts = dataurl.split(",");
  const mime = parts[0].match(/:(.*?);/)?.[1] || "application/octet-stream";
  const bstr = atob(parts[1]);
  const u8 = new Uint8Array(bstr.length);
  for (let i = 0; i < bstr.length; i++) u8[i] = bstr.charCodeAt(i);
  return new Blob([u8], { type: mime });
}

export async function exportZip(frames: string[], name = "dither_frames.zip") {
  if (!frames || frames.length === 0) return;

  const zip = new JSZip();

  frames.forEach((url, i) => {
    const blob = dataURLtoBlob(url);
    zip.file(`frame_${String(i).padStart(3, "0")}.png`, blob);
  });

  const blob = await zip.generateAsync({ type: "blob" });

  const a = document.createElement("a");
  const url = URL.createObjectURL(blob);
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
