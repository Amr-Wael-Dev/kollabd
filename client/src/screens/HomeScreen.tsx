import { useState } from "react";
import { mockCreateRoom, mockJoinRoom } from "../mocks/ws";
import "./HomeScreen.css";

interface HomeScreenProps {
  onEnterRoom: () => void;
}

type View = "welcome" | "create" | "join";

export default function HomeScreen({ onEnterRoom }: HomeScreenProps) {
  const [view, setView] = useState<View>("welcome");
  const [userName, setUserName] = useState("");
  const [roomName, setRoomName] = useState("");
  const [roomId, setRoomId] = useState("");

  function handleCreate(e: React.SubmitEvent) {
    e.preventDefault();
    if (!userName.trim() || !roomName.trim()) return;
    mockCreateRoom(userName, roomName);
    onEnterRoom();
  }

  function handleJoin(e: React.SubmitEvent) {
    e.preventDefault();
    if (!userName.trim() || !roomId.trim()) return;
    mockJoinRoom(userName, roomId);
    onEnterRoom();
  }

  if (view === "welcome") {
    return (
      <div className="home-screen">
        <div className="home-card">
          <h1 className="home-title">Welcome to KollabD</h1>
          <p className="home-subtitle">A real-time collaborative whiteboard</p>
          <div className="home-actions">
            <button
              className="home-btn primary"
              onClick={() => setView("create")}
            >
              Create
            </button>
            <button
              className="home-btn secondary"
              onClick={() => setView("join")}
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
          />
          <input
            className="home-input"
            type="text"
            placeholder="Room Name"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
          />
          <div className="home-actions">
            <button type="submit" className="home-btn primary">
              Create
            </button>
            <button
              type="button"
              className="home-btn secondary"
              onClick={() => setView("welcome")}
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
        />
        <input
          className="home-input"
          type="text"
          placeholder="Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />
        <div className="home-actions">
          <button type="submit" className="home-btn primary">
            Join
          </button>
          <button
            type="button"
            className="home-btn secondary"
            onClick={() => setView("welcome")}
          >
            Back
          </button>
        </div>
      </form>
    </div>
  );
}
