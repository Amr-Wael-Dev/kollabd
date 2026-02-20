import { useRef, useEffect, useCallback } from "react";

function App() {
  const wsConnection = useRef<WebSocket>(null);

  useEffect(() => {
    const WS_URL = import.meta.env.VITE_WS_URL!;
    const socket = new WebSocket(WS_URL);

    // Connection opened
    socket.addEventListener("open", () => {
      socket.send("Connection established");
    });

    // Listen for messages
    socket.addEventListener("message", (event) => {
      console.log("Message from server ", event.data);
    });

    wsConnection.current = socket;

    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, []);

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

      wsConnection.current?.send(JSON.stringify({ x, y }));
    },
    [getCtx, getPos],
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

  return (
    <canvas
      ref={canvasRef}
      style={{ display: "block", cursor: "crosshair", background: "#fff" }}
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
      onTouchStart={startDrawing}
      onTouchMove={draw}
      onTouchEnd={stopDrawing}
      onTouchCancel={stopDrawing}
    />
  );
}

export default App;
