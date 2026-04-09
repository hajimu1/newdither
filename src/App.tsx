import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

// engine (상대경로 고정)
import { applyAdjust } from "./engine/adjust";
import { downsamplePixelGrid, upscalePixelGrid } from "./engine/resize";
import { PALETTES, hexToRgb, kmeansFromImageData } from "./engine/palette";
import { dither } from "./engine/dither";

import type { DitherSettings } from "./state/ditherSettings";
import { DEFAULT_DITHER_SETTINGS } from "./state/ditherSettings";

// ui
import LeftPanel from "./ui/panels/LeftPanel";
import PreviewPanel from "./ui/panels/PreviewPanel";

// engine gif
import { parseGif, exportZip } from "./engine/gif";
import PaletteModal from "./ui/modals/PaletteModal";
import { UI } from "./ui/theme";

// ===============================
// TYPES
// ===============================

type LoadedImage =
  | { type: "image"; src: string; width: number; height: number }
  | {
      type: "gif";
      frames: string[];
      delays: number[];
      width: number;
      height: number;
    };

// ===============================
// APP
// ===============================

export default function App() {
  // -------- state (draft / applied 분리)

  

  const [settingsDraft, setSettingsDraft] = useState<DitherSettings>(
    DEFAULT_DITHER_SETTINGS
  );
  const [settingsApplied, setSettingsApplied] = useState<DitherSettings>(
    DEFAULT_DITHER_SETTINGS
  );

  const [loaded, setLoaded] = useState<LoadedImage | null>(null);

  // ZIP / 최종 결과용
  const [resultFrames, setResultFrames] = useState<string[]>([]);

  // 프리뷰는 항상 1프레임
  const [previewFrame, setPreviewFrame] = useState<string | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [zipProgress, setZipProgress] = useState<number | null>(null);

  // 프리뷰 옵션 (기본: 정지)
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const [previewSpeed, setPreviewSpeed] = useState(1);

  const [previewScale, setPreviewScale] = useState(1);

  // -------- refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // -------- commit (UI → applied)
  const commitSettings = useCallback((next: DitherSettings) => {
    setSettingsApplied(next);
  }, []);

  const resetSettings = useCallback(() => {
    setSettingsDraft(DEFAULT_DITHER_SETTINGS);
    setSettingsApplied(DEFAULT_DITHER_SETTINGS);
    setPreviewPlaying(false);
  }, []);

  const [paletteOpen, setPaletteOpen] = useState(false);


  const setAndCommit = useCallback(
    (updater: (prev: DitherSettings) => DitherSettings) => {
      setSettingsDraft((prev) => {
        const next = updater(prev);
        setSettingsApplied(next);
        return next;
      });
    },
    []
  );

  // ===============================
  // FILE INPUT
  // ===============================


  

  const handleFile = useCallback(
    async (file: File) => {
      if (!file) return;

      const buf = await file.arrayBuffer();

      // ----- GIF
      if (file.type === "image/gif") {
        const parsed = parseGif(buf);

        // 🔒 핵심 수정: GIF 로드시 width/height를 settings에 주입
        const next: DitherSettings = {
          ...DEFAULT_DITHER_SETTINGS,
          ...settingsDraft,
          width: parsed.width,
          height: parsed.height,
        };

        setLoaded({
          type: "gif",
          frames: parsed.frames,
          delays: parsed.delays,
          width: parsed.width,
          height: parsed.height,
        });

        setSettingsDraft(next);
        setSettingsApplied(next);

        // 프리뷰는 항상 첫 프레임, 정지
        setPreviewFrame(parsed.frames[0] ?? null);
        setPreviewPlaying(false);

        setResultFrames([]);
        return;
      }

      // ----- IMAGE
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const next: DitherSettings = {
          ...DEFAULT_DITHER_SETTINGS,
          ...settingsDraft,
          width: img.width,
          height: img.height,
        };

        setLoaded({
          type: "image",
          src: url,
          width: img.width,
          height: img.height,
        });

        setSettingsDraft(next);
        setSettingsApplied(next);
        setPreviewFrame(null);
        setPreviewPlaying(false);
        setResultFrames([]);
      };
      img.src = url;
    },
    [settingsDraft]
  );

  // ===============================
  // CORE IMAGE PROCESS (단일 프레임)
  // ===============================

  const processImage = useCallback(
    async (src: string): Promise<string> => {
      const s = settingsApplied;

      const img = new Image();
      img.src = src;
      await img.decode();

      const targetW = s.width > 0 ? s.width : img.width;
      const targetH = s.height > 0 ? s.height : img.height;

      const off = document.createElement("canvas");
      off.width = targetW;
      off.height = targetH;

      const offCtx = off.getContext("2d", { willReadFrequently: true })!;
      offCtx.imageSmoothingEnabled = false;
      offCtx.drawImage(img, 0, 0, targetW, targetH);

      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
      canvas.width = targetW;
      canvas.height = targetH;

      ctx.drawImage(off, 0, 0);

      let imgData = ctx.getImageData(0, 0, targetW, targetH);
      imgData = applyAdjust(imgData, s);

      let palette: number[][];

      if (s.paletteMode === "auto") {
        const colors = kmeansFromImageData(imgData, s.autoPaletteCount);
        palette = colors.map(hexToRgb);
      } else if (s.paletteMode === "builtin") {
        const hexList = PALETTES[s.builtinPalette] ?? PALETTES.bw;
        palette = hexList.map(hexToRgb);
      } else {
        palette = s.customColors.map(hexToRgb);
      }

      const p = Math.max(1, s.pixelSize);
      let small = imgData;
      if (p > 1) small = downsamplePixelGrid(imgData, p);

      const dithered = dither(small, palette, s.algorithm, s.threshold);

      let finalImg = dithered;
      if (p > 1) finalImg = upscalePixelGrid(dithered, p);

      for (let i = 3; i < finalImg.data.length; i += 4) {
        finalImg.data[i] = 255;
      }

      ctx.putImageData(finalImg, 0, 0);
      return canvas.toDataURL("image/png");
    },
    [settingsApplied]
  );

  // ===============================
  // PREVIEW (1프레임 / 기본 정지)
  // ===============================

  useEffect(() => {
    if (!loaded) return;

    let cancelled = false;
    setIsProcessing(true);

    const src =
      loaded.type === "gif" ? loaded.frames[0] : loaded.src;

    processImage(src).then((out) => {
      if (!cancelled) {
        setPreviewFrame(out);
        setIsProcessing(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [loaded, settingsApplied, processImage]);

  // ===============================
  // PREVIEW PLAY (선택)
  // ===============================

  useEffect(() => {
    if (!previewPlaying) return;
    if (!loaded || loaded.type !== "gif") return;

    let cancelled = false;
    let index = 0;

    const tick = async () => {
      if (cancelled) return;

      const out = await processImage(loaded.frames[index]);
      if (!cancelled) setPreviewFrame(out);

      index = (index + 1) % loaded.frames.length;

      const baseDelay = loaded.delays[index] ?? 100;
      const delay = baseDelay / previewSpeed;

      setTimeout(tick, delay);
    };

    tick();

    return () => {
      cancelled = true;
    };
  }, [previewPlaying, previewSpeed, loaded, processImage]);

  // ===============================
  // ZIP EXPORT (여기서만 전체 프레임)
  // ===============================

  const handleSavePNG = useCallback(() => {
    if (!previewFrame) return;
  
    const a = document.createElement("a");
    a.href = previewFrame;
    a.download = "dither_output.png";
    a.click();
  }, [previewFrame]);
  

  const handleSaveZip = useCallback(async () => {
    if (!loaded || loaded.type !== "gif") return;

    setIsProcessing(true);
    setZipProgress(0);

    const total = loaded.frames.length;
    const out: string[] = [];

    for (let i = 0; i < total; i++) {
      const img = await processImage(loaded.frames[i]);
      out.push(img);
      setZipProgress(Math.round(((i + 1) / total) * 100));
    }

    await exportZip(out);
    setZipProgress(null);
    setIsProcessing(false);
  }, [loaded, processImage]);



  // ===============================
  // UI
  // ===============================
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100vw",
color: UI.colors.textMain,        height: "100vh",
        overflow: "hidden",
        background: UI.colors.bg,
        fontFamily: UI.font.ui,
        fontSize: 12,
      }}
    >
      {/* ================= TITLE BAR ================= */}
      <div
        style={{
          height: 28,
          display: "flex",
          alignItems: "center",
          padding: "0 10px",
          background: "#e6e6e6",
          borderBottom: "1px solid #9a9a9a",
          fontSize: 11,
          fontWeight: 700,
          userSelect: "none",
        }}
      >
        Dithering Utility
        <span style={{ marginLeft: 8, fontWeight: 400, color: "#555" }}>
          v0.1
        </span>
      </div>
  
      {/* ================= MAIN ================= */}
      <div
        style={{
          display: "flex",
          flex: 1,
          overflow: "hidden",
        }}
      >
        <LeftPanel
          settingsDraft={settingsDraft}
          setSettingsDraft={setSettingsDraft}
          onCommit={commitSettings}
          loadedType={loaded?.type ?? null}
          isProcessing={isProcessing}
          onFile={handleFile}
          onProcessGif={() => setPreviewPlaying((v) => !v)}
          onReset={resetSettings}
          previewScale={previewScale}
          setPreviewScale={setPreviewScale}
          onOpenPalette={() => setPaletteOpen(true)}
          onSavePNG={handleSavePNG}
          onSaveZip={handleSaveZip}
        />
  
        <PreviewPanel src={previewFrame} scale={previewScale} />
      </div>
  
      {/* ================= STATUS BAR ================= */}
      <div
        style={{
          height: 22,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 10px",
          background: "#e6e6e6",
          borderTop: "1px solid #9a9a9a",
          fontSize: 11,
          color: "#333",
        }}
      >
        <div>
          {loaded
            ? loaded.type === "gif"
              ? `GIF loaded (${loaded.frames.length} frames)`
              : `Image loaded (${loaded.width}×${loaded.height})`
            : "No image loaded"}
        </div>
  
        <div>
          {isProcessing
            ? "Processing…"
            : zipProgress !== null
            ? `Exporting… ${zipProgress}%`
            : "Ready"}
        </div>
      </div>
  
      {/* ================= ZIP PROGRESS (OVERLAY) ================= */}
      {zipProgress !== null && (
        <div
          style={{
            position: "fixed",
            bottom: 32,
            left: 12,
            fontSize: 11,
            background: "#ffffff",
            color: "#111",
            border: "1px solid #9a9a9a",
            padding: "6px 8px",
          }}
        >
          Processing GIF Frames… {zipProgress}%
        </div>
      )}
  
      {/* ================= PALETTE MODAL ================= */}
      {paletteOpen && (
        <PaletteModal
          settingsDraft={settingsDraft}
          setAndCommit={setAndCommit}
          onClose={() => setPaletteOpen(false)}
        />
      )}
  
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}  
