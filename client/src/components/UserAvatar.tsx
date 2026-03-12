import type { User } from "@kollabd/shared";
import "./UserAvatar.css";

interface UserAvatarProps {
  user: User;
  isCurrentUserAdmin: boolean;
  adminId: string;
  currentUserId: string;
  onKick?: (userId: string) => void;
}

export default function UserAvatar({
  user,
  isCurrentUserAdmin,
  adminId,
  currentUserId,
  onKick,
}: UserAvatarProps) {
  const isUserAdmin = user.id === adminId;
  const canKick = isCurrentUserAdmin && user.id !== currentUserId;

  return (
    <div className="user-avatar-wrapper">
      <div
        className="user-avatar"
        style={{ backgroundColor: user.color }}
        title={user.name}
      >
        {user.name?.[0]?.toUpperCase() ?? "?"}
      </div>
      <div className="user-avatar-popover">
        <span className="popover-name">{user.name}</span>
        {isUserAdmin && <span className="admin-badge">admin</span>}
        {canKick && onKick && (
          <button className="kick-btn" onClick={() => onKick(user.id)}>
            Kick
          </button>
        )}
      </div>
    </div>
  );
}
