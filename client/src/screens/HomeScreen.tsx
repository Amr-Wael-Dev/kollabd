import { useState } from "react";
import { useWs } from "../hooks/useWs";
import "./HomeScreen.css";

interface HomeScreenProps {
  onEnterRoom: () => void;
}

type View = "welcome" | "create" | "join";

export default function HomeScreen({ onEnterRoom }: HomeScreenProps) {
  const { createRoom, joinRoom, isConnected } = useWs();
  const [view, setView] = useState<View>("welcome");
  const [userName, setUserName] = useState("");
  const [roomName, setRoomName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!userName.trim() || !roomName.trim()) return;

    setIsLoading(true);
    try {
      await createRoom(userName, roomName);
      onEnterRoom();
    } catch {
      // Error is handled by the provider
    } finally {
      setIsLoading(false);
    }
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!userName.trim() || !roomId.trim()) return;

    setIsLoading(true);
    try {
      await joinRoom(userName, roomId);
      onEnterRoom();
    } catch {
      // Error is handled by the provider
    } finally {
      setIsLoading(false);
    }
  }

  if (view === "welcome") {
    return (
      <div className="home-screen">
        <div className="home-card">
          <h1 className="home-title">Welcome to KollabD</h1>
          <p className="home-subtitle">A real-time collaborative whiteboard</p>
          {!isConnected && (
            <p className="home-error">Connecting to server...</p>
          )}
          <div className="home-actions">
            <button
              className="home-btn primary"
              onClick={() => setView("create")}
              disabled={!isConnected}
            >
              Create
            </button>
            <button
              className="home-btn secondary"
              onClick={() => setView("join")}
              disabled={!isConnected}
            >
              Join
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === "create") {
    return (
      <div className="home-screen">
        <form className="home-card" onSubmit={handleCreate}>
          <h2 className="home-title">Create a Room</h2>
          <input
            className="home-input"
            type="text"
            placeholder="Your Name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            autoFocus
            disabled={isLoading}
          />
          <input
            className="home-input"
            type="text"
            placeholder="Room Name"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            disabled={isLoading}
          />
          <div className="home-actions">
            <button
              type="submit"
              className="home-btn primary"
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : "Create"}
            </button>
            <button
              type="button"
              className="home-btn secondary"
              onClick={() => setView("welcome")}
              disabled={isLoading}
            >
              Back
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="home-screen">
      <form className="home-card" onSubmit={handleJoin}>
        <h2 className="home-title">Join a Room</h2>
        <input
          className="home-input"
          type="text"
          placeholder="Your Name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          autoFocus
          disabled={isLoading}
        />
        <input
          className="home-input"
          type="text"
          placeholder="Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          disabled={isLoading}
        />
        <div className="home-actions">
          <button
            type="submit"
            className="home-btn primary"
            disabled={isLoading}
          >
            {isLoading ? "Joining..." : "Join"}
          </button>
          <button
            type="button"
            className="home-btn secondary"
            onClick={() => setView("welcome")}
            disabled={isLoading}
          >
            Back
          </button>
        </div>
      </form>
    </div>
  );
}
