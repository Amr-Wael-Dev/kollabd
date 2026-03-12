import { useState, useEffect, useRef, useCallback } from "react";
import type { Tool, StrokeStyle } from "../types/app";
import { useWs } from "../hooks/useWs";
import TopBar from "../components/TopBar";
import Canvas from "../components/Canvas";
import HorizontalToolbar from "../components/HorizontalToolbar";
import VerticalToolbar from "../components/VerticalToolbar";
import ZoomControls from "../components/ZoomControls";
import CursorOverlay from "../components/CursorOverlay";
import "./RoomScreen.css";

interface RoomScreenProps {
  onLeave: () => void;
}

export default function RoomScreen({ onLeave }: RoomScreenProps) {
  const { room, currentUserId, leaveRoom, kickUser, moveCursor } = useWs();
  const [activeTool, setActiveTool] = useState<Tool>("pointer");
  const [color, setColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [strokeStyle, setStrokeStyle] = useState<StrokeStyle>("solid");
  const [opacity, setOpacity] = useState(100);
  const [fontSize, setFontSize] = useState(16);
  const [alignment, setAlignment] = useState<"left" | "center" | "right">(
    "left",
  );
  const canvasAreaRef = useRef<HTMLDivElement>(null);
  const lastCursorSendTime = useRef(0);

  // Handle kicked from room
  useEffect(() => {
    if (!room) {
      onLeave();
    }
  }, [room, onLeave]);

  // Throttled cursor movement handler
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const now = Date.now();
      // Throttle to ~30fps (33ms)
      if (now - lastCursorSendTime.current < 33) return;

      if (!canvasAreaRef.current) return;

      const rect = canvasAreaRef.current.getBoundingClientRect();
      const position = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };

      moveCursor(position);
      lastCursorSendTime.current = now;
    },
    [moveCursor],
  );

  function handleLeave() {
    leaveRoom();
    onLeave();
  }

  function handleKick(userId: string) {
    kickUser(userId);
  }

  // Show loading or redirect if no room
  if (!room) {
    return (
      <div className="room-screen">
        <div className="room-loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="room-screen">
      <TopBar
        room={room}
        currentUserId={currentUserId || ""}
        onLeave={handleLeave}
        onKick={handleKick}
      />
      <div
        className="room-canvas-area"
        ref={canvasAreaRef}
        onMouseMove={handleMouseMove}
      >
        <Canvas />
        <CursorOverlay users={room.users} currentUserId={currentUserId} />
        <VerticalToolbar
          activeTool={activeTool}
          color={color}
          onColorChange={setColor}
          strokeWidth={strokeWidth}
          onStrokeWidthChange={setStrokeWidth}
          strokeStyle={strokeStyle}
          onStrokeStyleChange={setStrokeStyle}
          opacity={opacity}
          onOpacityChange={setOpacity}
          fontSize={fontSize}
          onFontSizeChange={setFontSize}
          alignment={alignment}
          onAlignmentChange={setAlignment}
        />
        <HorizontalToolbar
          activeTool={activeTool}
          onToolChange={setActiveTool}
        />
        <ZoomControls />
      </div>
    </div>
  );
}
