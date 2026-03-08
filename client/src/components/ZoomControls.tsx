import { ZoomIn, ZoomOut } from "lucide-react";
import { useState } from "react";
import "./ZoomControls.css";

export default function ZoomControls() {
  const [zoom, setZoom] = useState(100);

  return (
    <div className="zoom-controls">
      <button
        className="zoom-btn"
        onClick={() => setZoom((z) => Math.max(25, z - 25))}
        title="Zoom out"
      >
        <ZoomOut size={16} />
      </button>
      <span className="zoom-value">{zoom}%</span>
      <button
        className="zoom-btn"
        onClick={() => setZoom((z) => Math.min(200, z + 25))}
        title="Zoom in"
      >
        <ZoomIn size={16} />
      </button>
    </div>
  );
}
