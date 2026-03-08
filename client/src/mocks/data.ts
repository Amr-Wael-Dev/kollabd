import type { User, Room } from "@kollabd/shared";

export const mockCurrentUser: User = {
  id: "user-1",
  name: "You",
  cursor: { x: 0, y: 0 },
  color: "#6C5CE7",
};

export const mockUsers: User[] = [
  mockCurrentUser,
  {
    id: "user-2",
    name: "Alice",
    cursor: { x: 200, y: 150 },
    color: "#00B894",
  },
  {
    id: "user-3",
    name: "Bob",
    cursor: { x: 400, y: 300 },
    color: "#E17055",
  },
  {
    id: "user-4",
    name: "Charlie",
    cursor: { x: 600, y: 200 },
    color: "#0984E3",
  },
];

export const mockRoom: Room = {
  id: "room-abc123",
  name: "Design Session",
  users: mockUsers,
  adminId: "user-1",
  canvasElements: [],
};
