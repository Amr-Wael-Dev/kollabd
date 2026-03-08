import { useState } from "react";
import type { Tool, StrokeStyle } from "../types/app";
import { mockRoom, mockCurrentUser } from "../mocks/data";
import { mockLeaveRoom, mockKickUser } from "../mocks/ws";
import TopBar from "../components/TopBar";
import Canvas from "../components/Canvas";
import HorizontalToolbar from "../components/HorizontalToolbar";
import VerticalToolbar from "../components/VerticalToolbar";
import ZoomControls from "../components/ZoomControls";
import "./RoomScreen.css";

interface RoomScreenProps {
  onLeave: () => void;
}

export default function RoomScreen({ onLeave }: RoomScreenProps) {
  const [activeTool, setActiveTool] = useState<Tool>("pointer");
  const [color, setColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [strokeStyle, setStrokeStyle] = useState<StrokeStyle>("solid");
  const [opacity, setOpacity] = useState(100);
  const [fontSize, setFontSize] = useState(16);
  const [alignment, setAlignment] = useState<"left" | "center" | "right">(
    "left",
  );

  function handleLeave() {
    mockLeaveRoom();
    onLeave();
  }

  function handleKick(userId: string) {
    mockKickUser(userId);
  }

  return (
    <div className="room-screen">
      <TopBar
        room={mockRoom}
        currentUserId={mockCurrentUser.id}
        onLeave={handleLeave}
        onKick={handleKick}
      />
      <div className="room-canvas-area">
        <Canvas />
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
