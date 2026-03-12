import { useMemo } from "react";
import type { User } from "@kollabd/shared";
import "./CursorOverlay.css";

interface CursorOverlayProps {
  users: User[];
  currentUserId: string | null;
}

export default function CursorOverlay({
  users,
  currentUserId,
}: CursorOverlayProps) {
  const otherUsersCursors = useMemo(() => {
    return users.filter((user) => user.id !== currentUserId);
  }, [users, currentUserId]);

  return (
    <div className="cursor-overlay">
      {otherUsersCursors.map((user) => (
        <div
          key={user.id}
          className="cursor-pointer"
          style={{
            transform: `translate(${user.cursor.x}px, ${user.cursor.y}px)`,
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            className="cursor-icon"
          >
            <path
              d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87c.48 0 .72-.58.38-.92L5.89 2.84a.5.5 0 0 0-.39.37Z"
              fill={user.color}
              stroke="white"
              strokeWidth="1.5"
            />
          </svg>
          <span className="cursor-name" style={{ backgroundColor: user.color }}>
            {user.name}
          </span>
        </div>
      ))}
    </div>
  );
}
