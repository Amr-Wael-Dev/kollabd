import {
  MousePointer2,
  Pencil,
  Square,
  Circle,
  Minus,
  ArrowRight,
  Type,
  Eraser,
} from "lucide-react";
import type { Tool } from "../types/app";
import "./HorizontalToolbar.css";

interface HorizontalToolbarProps {
  activeTool: Tool;
  onToolChange: (tool: Tool) => void;
}

const tools: { tool: Tool; icon: React.ReactNode; label: string }[] = [
  { tool: "pointer", icon: <MousePointer2 size={20} />, label: "Select" },
  { tool: "draw", icon: <Pencil size={20} />, label: "Draw" },
  { tool: "rectangle", icon: <Square size={20} />, label: "Rectangle" },
  { tool: "ellipse", icon: <Circle size={20} />, label: "Ellipse" },
  { tool: "line", icon: <Minus size={20} />, label: "Line" },
  { tool: "arrow", icon: <ArrowRight size={20} />, label: "Arrow" },
  { tool: "text", icon: <Type size={20} />, label: "Text" },
  { tool: "eraser", icon: <Eraser size={20} />, label: "Eraser" },
];

export default function HorizontalToolbar({
  activeTool,
  onToolChange,
}: HorizontalToolbarProps) {
  return (
    <div className="h-toolbar">
      {tools.map(({ tool, icon, label }) => (
        <button
          key={tool}
          className={`h-toolbar-btn${activeTool === tool ? " active" : ""}`}
          onClick={() => onToolChange(tool)}
          title={label}
        >
          {icon}
        </button>
      ))}
    </div>
  );
}
