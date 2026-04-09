// src/state/ditherSettings.ts
// ===============================================================
// DITHER SETTINGS — SINGLE SOURCE OF TRUTH
// ===============================================================

// ===============================
// TYPES
// ===============================

export type DitherAlgorithm =
  | "floyd"
  | "atkinson"
  | "jarvis"
  | "stucki"
  | "burkes"
  | "sierra"
  | "two-row-sierra"
  | "sierra-lite"
  | "threshold"
  | "random"
  | "bayer-2"
  | "bayer-4"
  | "bayer-8"
  | "bayer-16"
  | "cluster-4"
  | "diag-8"
  // ===== 추가 =====
  | "blue-noise"
  | "ign"
  | "value-noise"
  | "adaptive-threshold"
  | "mean-threshold"
  | "dot-diffusion"
  | "line-diffusion"
  | "ordered-noise";


export type PaletteMode = "auto" | "builtin" | "custom";

export interface DitherSettings {
  // ===============================
  // Size / Resize
  // ===============================
  width: number;
  height: number;
  pixelSize: number;
  keepRatio: boolean;

  // ===============================
  // Color Adjust
  // ===============================
  brightness: number;   // -100 ~ 100
  contrast: number;     // -100 ~ 100
  saturation: number;   // -100 ~ 100
  gamma: number;        // 10 ~ 300

  blackPoint: number;   // 0 ~ 254
  whitePoint: number;   // 1 ~ 255
  grain: number;        // 0 ~ 50

  // ===============================
  // Dither
  // ===============================
  algorithm: DitherAlgorithm;
  threshold: number;    // 0 ~ 255

  // ===============================
  // Palette
  // ===============================
  paletteMode: PaletteMode;

  // auto
  autoPaletteCount: number;

  // builtin
  builtinPalette: string;

  // custom
  customColors: string[];

  // ===============================
  // Tone (후처리용, 아직 UI 없음)
  // ===============================
  paletteTone: "soft" | "neutral" | "hard" | "contrast";
}

// ===============================
// DEFAULT
// ===============================

export const DEFAULT_DITHER_SETTINGS: DitherSettings = {
  // size
  width: 0,
  height: 0,
  pixelSize: 1,
  keepRatio: true,

  // adjust
  brightness: 0,
  contrast: 0,
  saturation: 0,
  gamma: 100,

  blackPoint: 0,
  whitePoint: 255,
  grain: 0,

  // dither
  algorithm: "floyd",
  threshold: 128,

  // palette
  paletteMode: "builtin",
  autoPaletteCount: 8,
  builtinPalette: "bw",
  customColors: ["#000000", "#ffffff"],

  // tone
  paletteTone: "neutral",
};
