import type { User } from "@kollabd/shared";
import "./UserAvatar.css";

interface UserAvatarProps {
  user: User;
  isAdmin?: boolean;
  onKick?: (userId: string) => void;
}

export default function UserAvatar({ user, isAdmin, onKick }: UserAvatarProps) {
  return (
    <div className="user-avatar-wrapper">
      <div
        className="user-avatar"
        style={{ backgroundColor: user.color }}
        title={user.name}
      >
        {user.name[0].toUpperCase()}
      </div>
      <div className="user-avatar-popover">
        <span className="popover-name">{user.name}</span>
        {isAdmin && <span className="admin-badge">admin</span>}
        {isAdmin && onKick && (
          <button className="kick-btn" onClick={() => onKick(user.id)}>
            Kick
          </button>
        )}
      </div>
    </div>
  );
}
