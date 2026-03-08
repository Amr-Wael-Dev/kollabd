import { toast } from "sonner";
import { mockRoom, mockCurrentUser, mockUsers } from "./data";

export function mockCreateRoom(userName: string, roomName: string) {
  toast.success(`Room "${roomName}" created!`);
  return {
    userId: mockCurrentUser.id,
    color: mockCurrentUser.color,
    roomId: mockRoom.id,
    roomName,
    userName,
  };
}

export function mockJoinRoom(userName: string, roomId: string) {
  toast.success(`Joined room "${mockRoom.name}"!`);
  return {
    userId: mockCurrentUser.id,
    color: mockCurrentUser.color,
    roomName: mockRoom.name,
    users: mockUsers,
    canvasElements: [],
    userName,
    roomId,
  };
}

export function mockLeaveRoom() {
  toast("You left the room");
}

export function mockKickUser(userId: string) {
  const user = mockUsers.find((u) => u.id === userId);
  toast.success(`Kicked ${user?.name ?? "user"}`);
}

export function mockChangeColor(newColor: string) {
  toast.success(`Color changed to ${newColor}`);
}

export function mockMoveCursor(position: { x: number; y: number }) {
  console.info(`Cursor moved. Position: (${position.x}, ${position.y})`);
}

export function mockDraw() {
  toast.success("Element drawn");
}

export function mockErase(elementId: string) {
  toast.success(`Element erased. ID: ${elementId}`);
}
