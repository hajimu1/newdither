import React from 'react';
import type { DitherSettings } from '../../state/ditherSettings';
import { UI } from '../theme';

type Props = {
  settingsDraft: DitherSettings;
  setAndCommit: (updater: (prev: DitherSettings) => DitherSettings) => void;
  onClose: () => void;
};

export default function PaletteModal({
  settingsDraft,
  setAndCommit,
  onClose,
}: Props) {
  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'transparent',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'flex-end',
        paddingTop: 56,
        paddingRight: 16,
        zIndex: 1000,
        pointerEvents: 'none',
      }}
    >
      <div
        className="modal-window"
        style={{
          width: 420,
          maxHeight: '80vh',
          overflowY: 'auto',
          background: UI.colors.panel,
          border: `1px solid ${UI.colors.borderMid}`,
          boxShadow: UI.shadowRaised,
          padding: 12,
          pointerEvents: 'auto',
          position: 'relative',
          fontSize: 11,
          fontFamily: UI.font.ui,
        }}
      >
        {/* CLOSE */}
        <button
          onClick={onClose}
          style={{
            ...UI.buttons.classic,
            position: 'absolute',
            top: 6,
            right: 6,
            padding: '2px 6px',
          }}
        >
          Close
        </button>

        {/* PALETTE */}
        <fieldset
          style={{
            border: `1px solid ${UI.colors.borderMid}`,
            padding: 8,
          }}
        >
          <legend>Palette</legend>

          {/* MODE */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
            {[
              { key: 'auto', label: 'Auto' },
              { key: 'builtin', label: 'Built-in' },
              { key: 'custom', label: 'Custom' },
            ].map((m) => (
              <button
                key={m.key}
                onClick={() =>
                  setAndCommit((s) => ({
                    ...s,
                    paletteMode: m.key as any,
                  }))
                }
                style={{
                  ...UI.buttons.classic,
                  ...(settingsDraft.paletteMode === m.key
                    ? UI.buttons.active
                    : {}),
                  flex: 1,
                  padding: '6px 0',
                }}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* CUSTOM */}
          {settingsDraft.paletteMode === 'custom' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {settingsDraft.customColors.map((c, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <input
                    type="color"
                    value={c}
                    onChange={(e) => {
                      const v = e.target.value;
                      setAndCommit((s) => {
                        const next = [...s.customColors];
                        next[idx] = v;
                        return { ...s, customColors: next };
                      });
                    }}
                    style={{
                      width: 28,
                      height: 20,
                      border: `1px solid ${UI.colors.borderDark}`,
                      padding: 0,
                    }}
                  />

                  <span style={{ fontSize: 11 }}>{c}</span>

                  <button
                    disabled={settingsDraft.customColors.length <= 2}
                    onClick={() =>
                      setAndCommit((s) => ({
                        ...s,
                        customColors: s.customColors.filter(
                          (_, i) => i !== idx
                        ),
                      }))
                    }
                    style={{
                      ...UI.buttons.classic,
                      ...(settingsDraft.customColors.length <= 2
                        ? UI.buttons.disabled
                        : {}),
                      marginLeft: 'auto',
                      padding: '2px 6px',
                    }}
                  >
                    −
                  </button>
                </div>
              ))}

              <button
                onClick={() =>
                  setAndCommit((s) => ({
                    ...s,
                    customColors: [...s.customColors, '#ffffff'],
                  }))
                }
                style={{
                  ...UI.buttons.classic,
                  marginTop: 4,
                  padding: '4px 0',
                }}
              >
                + Add Color
              </button>
            </div>
          )}

          {/* AUTO */}
          {settingsDraft.paletteMode === 'auto' && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[2, 4, 6, 8, 12, 16].map((k) => (
                <button
                  key={k}
                  onClick={() =>
                    setAndCommit((s) => ({
                      ...s,
                      autoPaletteCount: k,
                    }))
                  }
                  style={{
                    ...UI.buttons.classic,
                    ...(settingsDraft.autoPaletteCount === k
                      ? UI.buttons.active
                      : {}),
                    minWidth: 44,
                    padding: '6px 0',
                  }}
                >
                  {k}
                </button>
              ))}
            </div>
          )}

          {/* BUILT-IN */}
          {settingsDraft.paletteMode === 'builtin' && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 6,
              }}
            >
              {[
                // ===== Core =====
                'bw',
                'gray8',
                'sepia',
                'gameboy',

                // ===== IBM / PC =====
                'ibmcga4',
                'samcoupe',
                'cga16',
                'cpc16',
                'cpc27',
                'vic20',

                // ===== Consoles =====
                'nes',
                'atari2600',
                'tms9918',
                'intellivision',
                'teletext8',

                // ===== Home Computers =====
                'commodore64',
                'amigaocs',
                'zx-spectrum',
                'apple2',
                'msx',

                // ===== Pixel Standard =====
                'pico8',
                'db16',
                'cold8',
                'laserpop8',
                'acidburst8',
                'jewel12',
                'festival12',
                'toxic8',
                'magma8',
                'aurora10',
                'comicpop8',
                'paradise12',
                'vaporwave6',
                'neon8',
              ].map((key) => (
                <button
                  key={key}
                  onClick={() =>
                    setAndCommit((s) => ({
                      ...s,
                      builtinPalette: key,
                    }))
                  }
                  style={{
                    ...UI.buttons.classic,
                    ...(settingsDraft.builtinPalette === key
                      ? UI.buttons.active
                      : {}),
                    padding: '6px 4px',
                  }}
                >
                  {key}
                </button>
              ))}
            </div>
          )}
        </fieldset>
      </div>
    </div>
  );
}
