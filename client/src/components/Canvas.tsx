import { useRef, useEffect, useCallback } from "react";
import "./Canvas.css";
import { useWs } from "../hooks/useWs";
import type { Point, DrawingElement } from "@kollabd/shared";

export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { currentUserColor, room, draw } = useWs();
  const currentDrawingRef = useRef<Point[]>([]);
  const isDrawingRef = useRef(false);

  // Render all canvas elements from room state
  const renderCanvas = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      if (!room) return;

      // Clear canvas
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      // Render each element
      for (const element of room.canvasElements) {
        if (element.type === "drawing") {
          const drawing = element as DrawingElement;
          if (drawing.points.length < 2) continue;

          ctx.beginPath();
          ctx.strokeStyle = drawing.color;
          ctx.lineWidth = 2;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";

          ctx.moveTo(drawing.points[0].x, drawing.points[0].y);
          for (let i = 1; i < drawing.points.length; i++) {
            ctx.lineTo(drawing.points[i].x, drawing.points[i].y);
          }
          ctx.stroke();
          ctx.closePath();
        }
        // Handle other element types (shapes, text) here in the future
      }
    },
    [room],
  );

  // Re-render when room state changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    renderCanvas(ctx);
  }, [room?.canvasElements, renderCanvas]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d")!;

    function resize() {
      canvas!.width = canvas!.offsetWidth;
      canvas!.height = canvas!.offsetHeight;
      renderCanvas(ctx);
    }

    function getPos(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }

    function startDraw(e: MouseEvent) {
      isDrawingRef.current = true;
      const { x, y } = getPos(e);
      currentDrawingRef.current = [{ x, y }];
      ctx.beginPath();
      ctx.moveTo(x, y);
    }

    function drawStroke(e: MouseEvent) {
      if (!isDrawingRef.current) return;
      const { x, y } = getPos(e);
      currentDrawingRef.current.push({ x, y });

      // Draw locally for immediate feedback
      ctx.lineTo(x, y);
      ctx.strokeStyle = currentUserColor || "#000";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
    }

    function stopDraw() {
      if (!isDrawingRef.current) return;
      isDrawingRef.current = false;
      ctx.closePath();

      // Send the drawing to the server if we have points
      if (currentDrawingRef.current.length >= 2 && room) {
        const element: DrawingElement = {
          id: crypto.randomUUID(),
          type: "drawing",
          points: [...currentDrawingRef.current],
          color: currentUserColor || "#000",
          opacity: 1,
        };
        draw(element);
      }

      currentDrawingRef.current = [];
    }

    resize();

    canvas.addEventListener("mousedown", startDraw);
    canvas.addEventListener("mousemove", drawStroke);
    window.addEventListener("mouseup", stopDraw);
    window.addEventListener("resize", resize);

    return () => {
      canvas.removeEventListener("mousedown", startDraw);
      canvas.removeEventListener("mousemove", drawStroke);
      window.removeEventListener("mouseup", stopDraw);
      window.removeEventListener("resize", resize);
    };
  }, [currentUserColor, room, draw, renderCanvas]);

  return (
    <div className="canvas-container">
      <canvas ref={canvasRef} className="canvas" />
    </div>
  );
}
