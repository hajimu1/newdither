// ui/components/Slider.tsx
import React from "react";

type Props = {
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  onChangeCommitted?: (value: number) => void; // 드래그 종료 시
  step?: number;
};

export default function Slider(props: Props) {
  const {
    label,
    min,
    max,
    value,
    onChange,
    onChangeCommitted,
    step = 1,
  } = props;

  return (
    <div style={{ marginBottom: 10 }}>
      {/* Label */}
      <label
        style={{
          fontSize: 11,
          display: "block",
          marginBottom: 4,
          userSelect: "none",
        }}
      >
        {label}: {value}
      </label>

      {/* Slider */}
      <input
        type="range"
        className="classic-slider"
        min={min}
        max={max}
        value={value}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        onMouseUp={(e) =>
          onChangeCommitted?.(
            Number((e.target as HTMLInputElement).value)
          )
        }
        onTouchEnd={(e) =>
          onChangeCommitted?.(
            Number((e.target as HTMLInputElement).value)
          )
        }
      />
    </div>
  );
}
