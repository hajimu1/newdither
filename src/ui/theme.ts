// src/ui/theme.ts
// =======================================
// Global Classic UI Theme (Win95 / MacOS)
// =======================================

export const UI = {
  colors: {
    bg: "#d4d0c8",
    panel: "#c0c0c0",

    borderLight: "#ffffff",
    borderMid: "#9a9a9a",
    borderDark: "#808080",

    textMain: "#111111",
    textSub: "#444444",

    accent: "#2a5bd7",
    accentSoft: "#4f79d9",
    accentBorder: "#1e3f8f",
  },

  shadowInset:
    "inset 1px 1px 0 #ffffff, inset -1px -1px 0 #808080",

  shadowRaised:
    "1px 1px 0 #ffffff, -1px -1px 0 #808080",

  font: {
    ui: `"PfStardust30", "Malgun Gothic", system-ui, sans-serif`,
    mono: `"ThinRounded", monospace`,
  },

  // =====================
  // Button Presets
  // =====================
  buttons: {
    classic: {
      background: "#c0c0c0",
      border: "1px solid #808080",
      boxShadow:
        "inset 1px 1px 0 #ffffff, inset -1px -1px 0 #808080",
      color: "#111111",
      fontSize: 11,
      cursor: "pointer",
    },

    pressed: {
      boxShadow:
        "inset -1px -1px 0 #ffffff, inset 1px 1px 0 #808080",
    },

    active: {
      background: "#2a5bd7",
      border: "1px solid #1e3f8f",
      color: "#ffffff",
    },

    disabled: {
      opacity: 0.6,
      cursor: "not-allowed",
    },
  },
};
