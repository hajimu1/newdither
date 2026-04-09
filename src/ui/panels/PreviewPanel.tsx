import React, { useMemo, useState } from "react";

type Props = {
  src: string | null;
  scale: number;
};

export default function PreviewPanel({ src, scale }: Props) {
  const [err, setErr] = useState<string | null>(null);
  const short = useMemo(() => (src ? src.slice(0, 40) : "null"), [src]);

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        background: "#d4d0c8",
        borderLeft: "1px solid #808080",
        minWidth: 0,
      }}
    >
      {/* Title Bar */}
      <div
        style={{
          height: 24,
          padding: "4px 8px",
          background: "#c0c0c0",
          borderBottom: "1px solid #808080",
          boxShadow:
            "inset 1px 1px 0 #ffffff, inset -1px -1px 0 #808080",
          fontSize: 12,
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          userSelect: "none",
        }}
      >
        Output Preview
      </div>

      {/* Content (원본 그대로) */}
      <div
        style={{
          flex: 1,
          position: "relative",
          background: "#ffffff",
          overflow: "auto",
          padding: 16,
          boxSizing: "border-box",
        }}
      >
        {!src ? (
          <div style={{ color: "#666" }}>이미지 없음 (src=null)</div>
        ) : (
          <div
            style={{
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              width: `${100 / scale}%`,
            }}
          >
            <img
              src={src}
              alt="preview"
              onLoad={() => setErr(null)}
              onError={() => setErr("IMG LOAD FAILED")}
              style={{
                display: "block",
                imageRendering: "pixelated",
                border: "1px solid #2a86ff",
                maxWidth: "none",
                maxHeight: "none",
              }}
            />

            <div
              style={{
                marginTop: 8,
                fontSize: 11,
                color: "#666",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>Preview (not final)</span>
              {src && <span>Scale: {Math.round(scale * 100)}%</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
