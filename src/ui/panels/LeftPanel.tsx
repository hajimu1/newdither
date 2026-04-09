import React, { useEffect, useRef, useState } from 'react';
import type { DitherSettings } from '../../state/ditherSettings';
import Slider from '../components/Slider';
import { UI } from '../theme';

type Props = {
  settingsDraft: DitherSettings;
  setSettingsDraft: React.Dispatch<React.SetStateAction<DitherSettings>>;
  onCommit: (next: DitherSettings) => void;

  loadedType: 'image' | 'gif' | null;
  isProcessing: boolean;

  onFile: (file: File) => void;
  onProcessGif: () => void;
  onSaveZip: () => void;
  onReset: () => void;
  onSavePNG: () => void;
  onOpenPalette: () => void;

  previewScale: number;
  setPreviewScale: React.Dispatch<React.SetStateAction<number>>;
};

export default function LeftPanel(props: Props) {
  const {
    settingsDraft,
    setSettingsDraft,
    onCommit,
    loadedType,
    isProcessing,
    onFile,
    onProcessGif,
    onSaveZip,
    onReset,
    onSavePNG,
    onOpenPalette,
    previewScale,
    setPreviewScale,
  } = props;

  // ============================================================
  // STRING DRAFT (Size 입력 안정화)
  // ============================================================

  const [wText, setWText] = useState<string>(String(settingsDraft.width ?? 0));
  const [hText, setHText] = useState<string>(String(settingsDraft.height ?? 0));

  const settingsRef = useRef(settingsDraft);
  useEffect(() => {
    settingsRef.current = settingsDraft;
  }, [settingsDraft]);

  useEffect(() => {
    setWText(String(settingsDraft.width ?? 0));
  }, [settingsDraft.width]);
  useEffect(() => {
    setHText(String(settingsDraft.height ?? 0));
  }, [settingsDraft.height]);

  const commitSize = (key: 'width' | 'height', raw: string) => {
    const n = Number(raw);
    if (!Number.isFinite(n) || n <= 0) {
      const cur = settingsRef.current[key];
      if (key === 'width') setWText(String(cur ?? 0));
      else setHText(String(cur ?? 0));
      return;
    }

    const value = Math.max(1, Math.floor(n));

    setSettingsDraft((prev) => {
      const next = { ...prev, [key]: value } as DitherSettings;

      if (prev.keepRatio && prev.width > 0 && prev.height > 0) {
        if (key === 'width') {
          next.height = Math.max(
            1,
            Math.round((value * prev.height) / prev.width)
          );
        } else {
          next.width = Math.max(
            1,
            Math.round((value * prev.width) / prev.height)
          );
        }
      }

      queueMicrotask(() => {
        setWText(String(next.width ?? 0));
        setHText(String(next.height ?? 0));
        onCommit(next);
      });

      return next;
    });
  };

  const setAndCommit = (updater: (prev: DitherSettings) => DitherSettings) => {
    setSettingsDraft((prev) => {
      const next = updater(prev);
      queueMicrotask(() => onCommit(next));
      return next;
    });
  };

  const setDraftOnly = (updater: (prev: DitherSettings) => DitherSettings) => {
    setSettingsDraft((prev) => updater(prev));
  };

  // ===============================
  // Classic Button Styles
  // ===============================

  const classicButton: React.CSSProperties = {
    width: '100%',
    padding: '6px 0',
    background: UI.colors.panel,
    border: `1px solid ${UI.colors.borderDark}`,
    boxShadow: UI.shadowInset,
    color: UI.colors.textMain,
    fontSize: 11,
    cursor: 'pointer',
  };

  const classicButtonDisabled: React.CSSProperties = {
    opacity: 0.6,
    cursor: 'not-allowed',
  };

  // ------------------------------------------------------------
  // UI
  // ------------------------------------------------------------
  return (
    <div
      style={{
        width: 320,
        padding: 12,
        background: UI.colors.panel,
        borderRight: `1px solid ${UI.colors.borderDark}`,
        boxShadow: UI.shadowInset,
        overflowY: 'auto',
      }}
    >
      {/* TITLE */}
      <h3
        style={{
          marginBottom: 12,
          fontSize: 14,
          fontWeight: 700,
        }}
      >
        Dithering Controls
      </h3>

      {/* FILE */}
      <div style={{ marginBottom: 12 }}>
        <input
          type="file"
          accept="image/*,image/gif"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
          }}
        />
      </div>

      {/* SIZE */}
      <fieldset
        style={{
          marginBottom: 12,
          border: '1px solid #9a9a9a',
          padding: 8,
        }}
      >
        <legend style={{ fontSize: 12, fontWeight: 700 }}>Size</legend>

        <label>
          W:
          <input
            type="text"
            inputMode="numeric"
            value={wText}
            onChange={(e) => setWText(e.target.value)}
            onBlur={() => commitSize('width', wText)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                commitSize('width', e.currentTarget.value);
                e.currentTarget.blur();
              }
            }}
            style={{ width: 88 }}
          />
        </label>

        <label style={{ marginLeft: 8 }}>
          H:
          <input
            type="text"
            inputMode="numeric"
            value={hText}
            onChange={(e) => setHText(e.target.value)}
            onBlur={() => commitSize('height', hText)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                commitSize('height', e.currentTarget.value);
                e.currentTarget.blur();
              }
            }}
            style={{ width: 88 }}
          />
        </label>

        <label style={{ display: 'block', marginTop: 6 }}>
          <input
            type="checkbox"
            checked={settingsDraft.keepRatio}
            onChange={(e) =>
              setAndCommit((s) => ({ ...s, keepRatio: e.target.checked }))
            }
          />
          비율 유지 (Lock Aspect Ratio)
        </label>
      </fieldset>

      {/* PIXEL */}
      <fieldset
        style={{
          marginBottom: 12,
          border: '1px solid #9a9a9a',
          padding: 8,
        }}
      >
        <legend style={{ fontSize: 12, fontWeight: 700 }}>Pixel</legend>

        <Slider
          label="Pixel Size"
          min={1}
          max={16}
          value={settingsDraft.pixelSize}
          onChange={(v) =>
            setDraftOnly((s) => ({ ...s, pixelSize: Number(v) }))
          }
          onChangeCommitted={(v) =>
            setAndCommit((s) => ({ ...s, pixelSize: Number(v) }))
          }
        />
      </fieldset>

      {/* PREVIEW */}
      <fieldset style={{ marginBottom: 12 }}>
        <legend style={{ fontSize: 12, fontWeight: 700 }}>Preview</legend>

        <div style={{ fontSize: 11, marginBottom: 6, color: '#00000f' }}>
          미리보기는 1프레임 기준이며, 저장 시에만 적용되지 않습니다.
        </div>

        {loadedType === 'gif' && (
          <button
            onClick={onProcessGif}
            disabled={isProcessing}
            style={{
              ...classicButton,
              ...(isProcessing ? classicButtonDisabled : {}),
            }}
          >
            ▶ Play Preview (Low Quality)
          </button>
        )}
      </fieldset>

      {/* ADJUST */}
      <fieldset
        style={{
          marginBottom: 12,
          border: '1px solid #9a9a9a',
          padding: 8,
        }}
      >
        <legend>Adjust</legend>

        <Slider
          label="brightness"
          min={-100}
          max={100}
          value={(settingsDraft as any).brightness}
          onChange={(v) =>
            setDraftOnly((s) => ({ ...s, brightness: Number(v) }))
          }
          onChangeCommitted={(v) =>
            setAndCommit((s) => ({ ...s, brightness: Number(v) }))
          }
          step={1}
        />
        <Slider
          label="contrast"
          min={-100}
          max={100}
          value={(settingsDraft as any).contrast}
          onChange={(v) => setDraftOnly((s) => ({ ...s, contrast: Number(v) }))}
          onChangeCommitted={(v) =>
            setAndCommit((s) => ({ ...s, contrast: Number(v) }))
          }
          step={1}
        />
        <Slider
          label="saturation"
          min={-100}
          max={100}
          value={(settingsDraft as any).saturation}
          onChange={(v) =>
            setDraftOnly((s) => ({ ...s, saturation: Number(v) }))
          }
          onChangeCommitted={(v) =>
            setAndCommit((s) => ({ ...s, saturation: Number(v) }))
          }
          step={1}
        />
        <Slider
          label="gamma"
          min={10}
          max={300}
          value={(settingsDraft as any).gamma}
          onChange={(v) => setDraftOnly((s) => ({ ...s, gamma: Number(v) }))}
          onChangeCommitted={(v) =>
            setAndCommit((s) => ({ ...s, gamma: Number(v) }))
          }
          step={1}
        />
        <Slider
          label="threshold"
          min={0}
          max={255}
          value={(settingsDraft as any).threshold}
          onChange={(v) =>
            setDraftOnly((s) => ({ ...s, threshold: Number(v) }))
          }
          onChangeCommitted={(v) =>
            setAndCommit((s) => ({ ...s, threshold: Number(v) }))
          }
          step={1}
        />
        {/* BLACK / WHITE POINT */}
        <Slider
          label="Black Point"
          min={0}
          max={254}
          value={(settingsDraft as any).blackPoint ?? 0}
          onChange={(v) =>
            setDraftOnly((s) => ({ ...s, blackPoint: Number(v) }))
          }
          onChangeCommitted={(v) =>
            setAndCommit((s) => ({ ...s, blackPoint: Number(v) }))
          }
          step={1}
        />

        <Slider
          label="White Point"
          min={1}
          max={255}
          value={(settingsDraft as any).whitePoint ?? 255}
          onChange={(v) =>
            setDraftOnly((s) => ({ ...s, whitePoint: Number(v) }))
          }
          onChangeCommitted={(v) =>
            setAndCommit((s) => ({ ...s, whitePoint: Number(v) }))
          }
          step={1}
        />

        {/* GRAIN */}
        <Slider
          label="Grain"
          min={0}
          max={50}
          value={(settingsDraft as any).grain ?? 0}
          onChange={(v) => setDraftOnly((s) => ({ ...s, grain: Number(v) }))}
          onChangeCommitted={(v) =>
            setAndCommit((s) => ({ ...s, grain: Number(v) }))
          }
          step={1}
        />
      </fieldset>

      {/* DITHER */}
      <fieldset
        style={{
          marginBottom: 12,
          border: '1px solid #9a9a9a',
          padding: 8,
        }}
      >
        <legend>Dither</legend>

        <select
          value={settingsDraft.algorithm}
          onChange={(e) =>
            setAndCommit((s) => ({
              ...s,
              algorithm: e.target.value,
            }))
          }
          style={{ width: '100%' }}
        >
          <option value="floyd">Floyd–Steinberg</option>
          <option value="atkinson">Atkinson</option>
          <option value="jarvis">Jarvis</option>
          <option value="stucki">Stucki</option>
          <option value="burkes">Burkes</option>
          <option value="sierra">Sierra</option>
          <option value="two-row-sierra">Two-row Sierra</option>
          <option value="sierra-lite">Sierra Lite</option>

          <option value="threshold">Threshold</option>
          <option value="adaptive-threshold">Adaptive Threshold</option>
          <option value="random">Random</option>
          <option value="blue-noise">Blue Noise</option>
          <option value="ign">IGN Noise</option>
          <option value="ordered-noise">ordered-noise</option>
          <option value="value-noise">Value Noise</option>

          <option value="bayer-2">Bayer 2×2</option>
          <option value="bayer-3">Bayer 3×3</option>
          <option value="bayer-4">Bayer 4×4</option>
          <option value="bayer-8">Bayer 8×8</option>
          <option value="bayer-16">Bayer 16×16</option>
          <option value="cluster-4">Cluster 4×4</option>
          <option value="cluster-6">Cluster 6×6</option>
          <option value="cluster-8">Cluster 8×8</option>
          <option value="void-cluster-8">Void Cluster 8×8</option>
          <option value="diag-8">Diagonal 8×8</option>
          <option value="dot-diffusion">Dot Diffusion</option>
          <option value="line-diffusion">Line Diffusion</option>
        </select>
      </fieldset>

      <fieldset>
        <legend>Palette</legend>
        <button onClick={onOpenPalette} style={classicButton}>
          Open Palette…
        </button>
      </fieldset>

      {/* GIF */}
      {loadedType === 'gif' && (
        <fieldset
          style={{
            marginBottom: 12,
            border: '1px solid #9a9a9a',
            padding: 8,
          }}
        >
          <legend>GIF</legend>

          <button
            disabled={isProcessing}
            onClick={onProcessGif}
            style={{ marginRight: 8 }}
          >
            Process GIF
          </button>
        </fieldset>
      )}

      {/* EXPORT */}
      <fieldset
        style={{
          marginBottom: 12,
          border: '1px solid #9a9a9a',
          padding: 8,
        }}
      >
        <legend>Export</legend>

        <div style={{ fontSize: 11, marginBottom: 6, color: '#444' }}>
          PNG: 현재 프리뷰 1프레임 저장
        </div>

        <button
          onClick={onSavePNG}
          disabled={isProcessing}
          style={{
            ...classicButton,
            ...(isProcessing ? classicButtonDisabled : {}),
          }}
        >
          Save PNG
        </button>

        {loadedType === 'gif' && (
          <>
            <div style={{ fontSize: 11, marginBottom: 6, color: '#444' }}>
              ZIP: 모든 프레임 처리 후 저장
            </div>

            <button
              onClick={onSaveZip}
              disabled={isProcessing}
              style={{
                ...classicButton,
                ...(isProcessing ? classicButtonDisabled : {}),
              }}
            >
              Save ZIP (All Frames)
            </button>
          </>
        )}
      </fieldset>

      <button
        onClick={onReset}
        style={{
          ...classicButton,
          marginTop: 16,
        }}
      >
        Reset Settings
      </button>
      {isProcessing && <div style={{ color: '#ffcc66' }}>Processing…</div>}
    </div>
  );
}
