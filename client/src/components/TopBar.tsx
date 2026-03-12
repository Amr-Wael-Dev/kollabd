import { LogOut, Copy } from "lucide-react";
import { toast } from "sonner";
import type { User, Room } from "@kollabd/shared";
import UserAvatar from "./UserAvatar";
import "./TopBar.css";

interface TopBarProps {
  room: Room;
  currentUserId: string;
  onLeave: () => void;
  onKick: (userId: string) => void;
}

export default function TopBar({
  room,
  currentUserId,
  onLeave,
  onKick,
}: TopBarProps) {
  const isAdmin = room.adminId === currentUserId;

  function copyRoomId() {
    navigator.clipboard.writeText(room.id);
    toast.success("Room ID copied!");
  }

  return (
    <div className="top-bar">
      <div className="top-bar-left">
        <h2 className="room-name">{room.name}</h2>
        <button className="room-id-btn" onClick={copyRoomId}>
          <span className="room-id-text">{room.id}</span>
          <Copy size={12} />
        </button>
      </div>

      <div className="top-bar-right">
        <div className="user-avatars">
          {room.users.map((user: User) => (
            <UserAvatar
              key={user.id}
              user={user}
              isCurrentUserAdmin={isAdmin}
              adminId={room.adminId}
              currentUserId={currentUserId}
              onKick={onKick}
            />
          ))}
        </div>
        <button className="leave-btn" onClick={onLeave} title="Leave room">
          <LogOut size={18} />
        </button>
      </div>
    </div>
  );
}
