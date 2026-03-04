import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

interface RoomInfoCardProps {
  roomId: string;
  roomName: string;
  userName: string;
  userId: string;
  connected: boolean;
}

export default function RoomInfoCard({
  roomId,
  roomName,
  userName,
  userId,
  connected,
}: RoomInfoCardProps) {
  const [copied, setCopied] = useState(false);

  const copyRoomId = async () => {
    await navigator.clipboard.writeText(roomId);
    setCopied(true);
    toast.success("Room ID copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="room-info-card">
      <div className="room-info-row">
        <span className="room-info-label">Room</span>
        <span className="room-info-value">{roomName}</span>
      </div>
      <div className="room-info-row">
        <span className="room-info-label">Room ID</span>
        <span className="room-info-value room-id-value">
          <code>{roomId.slice(0, 8)}...</code>
          <button
            className="copy-btn"
            onClick={copyRoomId}
            title="Copy Room ID"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </span>
      </div>
      <div className="room-info-row">
        <span className="room-info-label">User</span>
        <span className="room-info-value">{userName}</span>
      </div>
      <div className="room-info-row">
        <span className="room-info-label">User ID</span>
        <span className="room-info-value">
          <code>{userId.slice(0, 8)}...</code>
        </span>
      </div>
      <div className="room-info-row">
        <span className="room-info-label">Status</span>
        <span className="room-info-value">
          <span
            className={`status-dot ${connected ? "status-connected" : "status-disconnected"}`}
          />
          {connected ? "Connected" : "Disconnected"}
        </span>
      </div>
    </div>
  );
}
