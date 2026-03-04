import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { useWebSocket } from "../hooks/useWebSocket";
import Whiteboard from "./Whiteboard";
import type {
  CreateMessage,
  JoinMessage,
  ServerMessage,
} from "@kollabd/shared";

type Screen = "welcome" | "create" | "join" | "whiteboard";

export default function ScreenManager() {
  const [roomName, setRoomName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");

  const [screen, setScreen] = useState<Screen>("welcome");
  const [connecting, setConnecting] = useState(false);
  const { webSocket, setWebSocket } = useWebSocket();

  useEffect(() => {
    return () => {
      if (webSocket?.readyState === WebSocket.OPEN) {
        webSocket?.close();
      }
    };
  }, [webSocket]);

  const connectToWebSocket = useCallback(
    (payload: CreateMessage | JoinMessage) => {
      setConnecting(true);
      const WS_URL = import.meta.env.VITE_WS_URL!;
      const socket = new WebSocket(WS_URL);

      socket.addEventListener("open", () => {
        socket.send(JSON.stringify(payload));
      });

      socket.addEventListener("message", (event) => {
        const message: ServerMessage = JSON.parse(event.data);

        if ("error" in message) {
          toast.error(message.error);
          setConnecting(false);
          socket.close();
          return;
        }

        if ("roomId" in message) setRoomId(message.roomId);
        if ("roomName" in message) setRoomName(message.roomName);
        if ("userId" in message) setUserId(message.userId);
        setConnecting(false);
        setScreen("whiteboard");
        toast.success("Connected to room!");
      });

      socket.addEventListener("close", () => {});

      socket.addEventListener("error", () => {
        toast.error("Failed to connect to server");
        setConnecting(false);
      });

      setWebSocket(socket);
    },
    [setWebSocket],
  );

  if (screen === "welcome") {
    return (
      <div className="center">
        <h1 className="title">KollabD</h1>
        <p className="subtitle">A collaborative whiteboard</p>
        <div className="button-group">
          <button className="btn" onClick={() => setScreen("create")}>
            Create Room
          </button>
          <button
            className="btn btn-secondary"
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
      <div className="center">
        <h2 className="heading">Create a Room</h2>
        <form
          className="form"
          onSubmit={(e) => {
            e.preventDefault();
            connectToWebSocket({ roomName, userName, type: "create" });
          }}
        >
          <label className="label">
            Room Name
            <input
              className="input"
              type="text"
              placeholder="My Room"
              required
              value={roomName}
              onChange={(event) => setRoomName(event.target.value)}
            />
          </label>
          <label className="label">
            Username
            <input
              className="input"
              type="text"
              placeholder="Your name"
              required
              value={userName}
              onChange={(event) => setUserName(event.target.value)}
            />
          </label>
          <div className="button-group-tight">
            <button type="submit" className="btn" disabled={connecting}>
              {connecting ? "Creating..." : "Create"}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
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
      <div className="center">
        <h2 className="heading">Join a Room</h2>
        <form
          className="form"
          onSubmit={(e) => {
            e.preventDefault();
            connectToWebSocket({ roomId, userName, type: "join" });
          }}
        >
          <label className="label">
            Room ID
            <input
              className="input"
              type="text"
              placeholder="Enter room ID"
              required
              value={roomId}
              onChange={(event) => setRoomId(event.target.value)}
            />
          </label>
          <label className="label">
            Username
            <input
              className="input"
              type="text"
              placeholder="Your name"
              required
              value={userName}
              onChange={(event) => setUserName(event.target.value)}
            />
          </label>
          <div className="button-group-tight">
            <button type="submit" className="btn" disabled={connecting}>
              {connecting ? "Joining..." : "Join"}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setScreen("welcome")}
            >
              Back
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <Whiteboard
      userId={userId}
      userName={userName}
      roomId={roomId}
      roomName={roomName}
    />
  );
}
