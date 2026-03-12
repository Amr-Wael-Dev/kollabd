import type { CanvasElement } from "./canvasElement";
import type { Room } from "./room";
import type { User } from "./user";

export interface BaseEvent {
  type: string;
  timestamp: number;
}

export interface CreateRoomEvent extends BaseEvent {
  type: "create";
  userName: User["name"];
  roomName: Room["name"];
}

export interface JoinRoomEvent extends BaseEvent {
  type: "join";
  userName: User["name"];
  roomId: Room["id"];
}

export interface MoveCursorEvent extends BaseEvent {
  type: "moveCursor";
  userId: User["id"];
  roomId: Room["id"];
  position: User["cursor"];
}

export interface ChangeColorEvent extends BaseEvent {
  type: "changeColor";
  userId: User["id"];
  roomId: Room["id"];
  newColor: User["color"];
}

export interface KickUserEvent extends BaseEvent {
  type: "kickUser";
  roomId: Room["id"];
  userId: User["id"];
  kickedUserId: User["id"];
}

export interface LeaveRoomEvent extends BaseEvent {
  type: "leaveRoom";
  userId: User["id"];
  roomId: Room["id"];
}

export interface DrawEvent extends BaseEvent {
  type: "draw";
  roomId: Room["id"];
  userId: User["id"];
  element: CanvasElement;
}

export interface EraseEvent extends BaseEvent {
  type: "erase";
  roomId: Room["id"];
  userId: User["id"];
  elementId: CanvasElement["id"];
}

export interface RoomCreatedEvent extends BaseEvent {
  type: "roomCreated";
  userId: User["id"];
  userName: User["name"];
  color: User["color"];
  roomId: Room["id"];
  roomName: Room["name"];
}

export interface RoomJoinedEvent extends BaseEvent {
  type: "roomJoined";
  roomId: Room["id"];
  userId: User["id"];
  color: User["color"];
  roomName: Room["name"];
  adminId: Room["adminId"];
  users: User[];
  canvasElements: CanvasElement[];
}

export interface AcknowledgeEvent extends BaseEvent {
  // Fire & Forget, so no ID needed
  type: "acknowledge";
  success: boolean;
  message: string;
}

export interface UserJoinedEvent extends BaseEvent {
  type: "userJoined";
  newUserId: User["id"];
  newUserName: User["name"];
  color: User["color"];
}

export interface CursorMovedEvent extends BaseEvent {
  type: "cursorMoved";
  userId: User["id"];
  position: User["cursor"];
}

export interface ColorChangedEvent extends BaseEvent {
  type: "colorChanged";
  userId: User["id"];
  newColor: User["color"];
}

export interface UserKickedEvent extends BaseEvent {
  type: "userKicked";
  kickedUserId: User["id"];
}

export interface KickedEvent extends BaseEvent {
  type: "kicked";
  userId: User["id"];
}

export interface UserLeftEvent extends BaseEvent {
  type: "userLeft";
  userId: User["id"];
}

export interface ElementDrawnEvent extends BaseEvent {
  type: "elementDrawn";
  userId: User["id"];
  element: CanvasElement;
}

export interface ElementErasedEvent extends BaseEvent {
  type: "elementErased";
  userId: User["id"];
  elementId: CanvasElement["id"];
}
