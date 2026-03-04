import { useRef, useEffect, useCallback } from "react";
import { useWebSocket } from "../hooks/useWebSocket";
import RoomInfoCard from "./RoomInfoCard";

interface WhiteboardProps {
  userId: string;
  userName: string;
  roomId: string;
  roomName: string;
}

export default function Whiteboard({
  userId,
  userName,
  roomId,
  roomName,
}: WhiteboardProps) {
  const { webSocket } = useWebSocket();
  const wsRef = useRef(webSocket);
  useEffect(() => {
    wsRef.current = webSocket;
  }, [webSocket]);

  const sendDrawing = useCallback(
    (pos: { x: number; y: number }) => {
      const timestamp = new Date().toISOString();
      wsRef.current?.send(
        JSON.stringify({
          userId,
          ...pos,
          timestamp,
          type: "draw",
        }),
      );
    },
    [userId],
  );

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);

  const getCtx = useCallback(() => {
    return (
      canvasRef.current?.getContext("2d", { willReadFrequently: true }) ?? null
    );
  }, []);

  const getPos = useCallback(
    (e: React.MouseEvent | React.TouchEvent): { x: number; y: number } => {
      const canvas = canvasRef.current!;
      const rect = canvas.getBoundingClientRect();
      if ("touches" in e) {
        const touch = e.touches[0] ?? e.changedTouches[0];
        return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
      }
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    },
    [],
  );

  const startDrawing = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      const ctx = getCtx();
      if (!ctx) return;
      isDrawing.current = true;
      const { x, y } = getPos(e);
      ctx.beginPath();
      ctx.moveTo(x, y);
    },
    [getCtx, getPos],
  );

  const draw = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawing.current) return;
      const ctx = getCtx();
      if (!ctx) return;
      const { x, y } = getPos(e);
      ctx.lineTo(x, y);
      ctx.stroke();

      sendDrawing({ x, y });
    },
    [getCtx, getPos, sendDrawing],
  );

  const stopDrawing = useCallback(() => {
    isDrawing.current = false;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const imageData = canvas
        .getContext("2d", { willReadFrequently: true })
        ?.getImageData(0, 0, canvas.width, canvas.height);
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (imageData) {
        ctx.putImageData(imageData, 0, 0);
      }
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const connected = webSocket?.readyState === WebSocket.OPEN;

  return (
    <>
      <RoomInfoCard
        roomId={roomId}
        roomName={roomName}
        userName={userName}
        userId={userId}
        connected={connected}
      />
      <canvas
        ref={canvasRef}
        className="whiteboard"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        onTouchCancel={stopDrawing}
      />
    </>
  );
}
