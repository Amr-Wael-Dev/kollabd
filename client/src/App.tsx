import { useState, useRef, useEffect, useCallback } from "react";
import WebSocketProvider from "./providers/WebSocketProvider";
import { useWebSocket } from "./hooks/useWebSocket";

type Screen = "welcome" | "create" | "join" | "whiteboard";

function App() {
  return (
    <>
      <WebSocketProvider>
        <ScreenManager />
      </WebSocketProvider>
    </>
  );
}

function ScreenManager() {
  const [roomName, setRoomName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [userName, setUserName] = useState("");

  const [screen, setScreen] = useState<Screen>("welcome");
  const { webSocket, setWebSocket } = useWebSocket();

  useEffect(() => {
    return () => {
      if (webSocket?.readyState === WebSocket.OPEN) {
        console.log("[WS] Closing connection on unmount");
        webSocket?.close();
      }
    };
  }, [webSocket]);

  const connectToWebSocket = useCallback(
    (payload: Record<string, string>) => {
      const WS_URL = import.meta.env.VITE_WS_URL!;
      const socket = new WebSocket(WS_URL);

      socket.addEventListener("open", () => {
        console.log("Connection established");
        socket.send(JSON.stringify(payload));
      });

      socket.addEventListener("message", (event) => {
        console.log("Message from server ", event.data);
      });

      socket.addEventListener("close", () => {
        console.log("[WS] Connection closed");
      });

      socket.addEventListener("error", (event) => {
        console.error("[WS] Error:", event);
      });

      setWebSocket(socket);
    },
    [setWebSocket],
  );

  if (screen === "welcome") {
    return (
      <div style={styles.center}>
        <h1 style={{ marginBottom: 8 }}>KollabD</h1>
        <p style={{ color: "#666", marginBottom: 32 }}>
          A collaborative whiteboard
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <button style={styles.btn} onClick={() => setScreen("create")}>
            Create Room
          </button>
          <button
            style={{ ...styles.btn, ...styles.btnSecondary }}
            onClick={() => setScreen("join")}
          >
            Join Room
          </button>
        </div>
      </div>
    );
  }

  if (screen === "create") {
    return (
      <div style={styles.center}>
        <h2 style={{ marginBottom: 24 }}>Create a Room</h2>
        <form
          style={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            console.log("[App] Creating room, navigating to whiteboard");
            setScreen("whiteboard");
            connectToWebSocket({ roomName, userName, type: "create" });
          }}
        >
          <label style={styles.label}>
            Room Name
            <input
              style={styles.input}
              type="text"
              placeholder="My Room"
              required
              value={roomName}
              onChange={(event) => setRoomName(event.target.value)}
            />
          </label>
          <label style={styles.label}>
            Username
            <input
              style={styles.input}
              type="text"
              placeholder="Your name"
              required
              value={userName}
              onChange={(event) => setUserName(event.target.value)}
            />
          </label>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button type="submit" style={styles.btn}>
              Create
            </button>
            <button
              type="button"
              style={{ ...styles.btn, ...styles.btnSecondary }}
              onClick={() => setScreen("welcome")}
            >
              Back
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (screen === "join") {
    return (
      <div style={styles.center}>
        <h2 style={{ marginBottom: 24 }}>Join a Room</h2>
        <form
          style={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            console.log("[App] Joining room, navigating to whiteboard");
            setScreen("whiteboard");
            connectToWebSocket({ roomId, userName, type: "join" });
          }}
        >
          <label style={styles.label}>
            Room ID
            <input
              style={styles.input}
              type="text"
              placeholder="Enter room ID"
              required
              value={roomId}
              onChange={(event) => setRoomId(event.target.value)}
            />
          </label>
          <label style={styles.label}>
            Username
            <input
              style={styles.input}
              type="text"
              placeholder="Your name"
              required
              value={userName}
              onChange={(event) => setUserName(event.target.value)}
            />
          </label>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button type="submit" style={styles.btn}>
              Join
            </button>
            <button
              type="button"
              style={{ ...styles.btn, ...styles.btnSecondary }}
              onClick={() => setScreen("welcome")}
            >
              Back
            </button>
          </div>
        </form>
      </div>
    );
  }

  return <Whiteboard />;
}

function Whiteboard() {
  const { webSocket } = useWebSocket();
  const wsRef = useRef(webSocket);
  useEffect(() => {
    wsRef.current = webSocket;
  }, [webSocket]);

  const sendDrawing = useCallback((pos: { x: number; y: number }) => {
    const timestamp = new Date().toISOString();
    wsRef.current?.send(JSON.stringify({ ...pos, timestamp, type: "write" }));
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

const styles: Record<string, React.CSSProperties> = {
  center: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    fontFamily: "sans-serif",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    width: 280,
  },
  label: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    fontSize: 14,
    fontWeight: 500,
  },
  input: {
    padding: "8px 12px",
    borderRadius: 6,
    border: "1px solid #ccc",
    fontSize: 14,
    outline: "none",
  },
  btn: {
    padding: "10px 20px",
    borderRadius: 6,
    border: "none",
    background: "#000",
    color: "#fff",
    fontSize: 14,
    cursor: "pointer",
    flex: 1,
  },
  btnSecondary: {
    background: "#f0f0f0",
    color: "#000",
  },
};

export default App;
