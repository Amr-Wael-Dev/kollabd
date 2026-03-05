interface User {
  id: string;
  name: string;
  color: string;
}

const HARDCODED_USERS: User[] = [
  { id: "usr-1a2b3c4d", name: "Alice", color: "#4caf50" },
  { id: "usr-5e6f7g8h", name: "Bob", color: "#2196f3" },
];

export default function ActiveUsers() {
  
  return (
    <div className="active-users">
      <span className="active-users-label">Active ({HARDCODED_USERS.length})</span>
      <div className="active-users-list">
        {HARDCODED_USERS.map((user) => (
          <div key={user.id} className="active-user" title={user.name}>
            <span
              className="active-user-avatar"
              style={{ background: user.color }}
            >
              {user.name[0]}
            </span>
            <span className="active-user-name">{user.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
