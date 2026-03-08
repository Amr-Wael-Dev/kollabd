import { AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import type { Tool, StrokeStyle } from "../types/app";
import "./VerticalToolbar.css";

interface VerticalToolbarProps {
  activeTool: Tool;
  color: string;
  onColorChange: (color: string) => void;
  strokeWidth: number;
  onStrokeWidthChange: (width: number) => void;
  strokeStyle: StrokeStyle;
  onStrokeStyleChange: (style: StrokeStyle) => void;
  opacity: number;
  onOpacityChange: (opacity: number) => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  alignment: "left" | "center" | "right";
  onAlignmentChange: (alignment: "left" | "center" | "right") => void;
}

const hiddenTools: Tool[] = ["pointer", "eraser"];

export default function VerticalToolbar({
  activeTool,
  color,
  onColorChange,
  strokeWidth,
  onStrokeWidthChange,
  strokeStyle,
  onStrokeStyleChange,
  opacity,
  onOpacityChange,
  fontSize,
  onFontSizeChange,
  alignment,
  onAlignmentChange,
}: VerticalToolbarProps) {
  if (hiddenTools.includes(activeTool)) return null;

  const isText = activeTool === "text";

  return (
    <div className="v-toolbar">
      <div className="v-toolbar-group">
        <label className="v-toolbar-label">Color</label>
        <input
          type="color"
          value={color}
          onChange={(e) => onColorChange(e.target.value)}
          className="v-toolbar-color"
        />
      </div>

      {!isText && (
        <>
          <div className="v-toolbar-group">
            <label className="v-toolbar-label">
              Stroke <span className="v-toolbar-value">{strokeWidth}px</span>
            </label>
            <input
              type="range"
              min={1}
              max={20}
              value={strokeWidth}
              onChange={(e) => onStrokeWidthChange(Number(e.target.value))}
              className="v-toolbar-range"
            />
          </div>

          <div className="v-toolbar-group">
            <label className="v-toolbar-label">Style</label>
            <div className="v-toolbar-align">
              {(["solid", "dashed", "dotted"] as const).map((s) => (
                <button
                  key={s}
                  className={`v-toolbar-align-btn${strokeStyle === s ? " active" : ""}`}
                  onClick={() => onStrokeStyleChange(s)}
                  title={s.charAt(0).toUpperCase() + s.slice(1)}
                >
                  {s === "solid" && (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <line
                        x1="2"
                        y1="8"
                        x2="14"
                        y2="8"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                  )}
                  {s === "dashed" && (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <line
                        x1="2"
                        y1="8"
                        x2="14"
                        y2="8"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeDasharray="3 2"
                      />
                    </svg>
                  )}
                  {s === "dotted" && (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <line
                        x1="2"
                        y1="8"
                        x2="14"
                        y2="8"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeDasharray="1 2"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="v-toolbar-group">
        <label className="v-toolbar-label">
          Opacity <span className="v-toolbar-value">{opacity}%</span>
        </label>
        <input
          type="range"
          min={10}
          max={100}
          value={opacity}
          onChange={(e) => onOpacityChange(Number(e.target.value))}
          className="v-toolbar-range"
        />
      </div>

      {isText && (
        <>
          <div className="v-toolbar-group">
            <label className="v-toolbar-label">Font Size</label>
            <input
              type="number"
              min={8}
              max={120}
              value={fontSize}
              onChange={(e) => onFontSizeChange(Number(e.target.value))}
              className="v-toolbar-number"
            />
          </div>

          <div className="v-toolbar-group">
            <label className="v-toolbar-label">Align</label>
            <div className="v-toolbar-align">
              {(["left", "center", "right"] as const).map((a) => (
                <button
                  key={a}
                  className={`v-toolbar-align-btn${alignment === a ? " active" : ""}`}
                  onClick={() => onAlignmentChange(a)}
                  title={a}
                >
                  {a === "left" && <AlignLeft size={16} />}
                  {a === "center" && <AlignCenter size={16} />}
                  {a === "right" && <AlignRight size={16} />}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
