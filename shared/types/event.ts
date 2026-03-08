import { CanvasElement } from "./canvasElement";
import { Room } from "./room";
import { User } from "./user";

interface BaseEvent {
  type: string;
  timestamp: number;
}

interface CreateRoomEvent extends BaseEvent {
  type: "create";
  userName: User["name"];
  roomName: Room["name"];
}

interface JoinRoomEvent extends BaseEvent {
  type: "join";
  userName: User["name"];
  roomId: Room["id"];
}

interface MoveCursorEvent extends BaseEvent {
  type: "moveCursor";
  userId: User["id"];
  roomId: Room["id"];
  position: User["cursor"];
}

interface ChangeColorEvent extends BaseEvent {
  type: "changeColor";
  userId: User["id"];
  roomId: Room["id"];
  newColor: User["color"];
}

interface KickUserEvent extends BaseEvent {
  type: "kickUser";
  roomId: Room["id"];
  userId: User["id"];
  kickedUserId: User["id"];
}

interface LeaveRoomEvent extends BaseEvent {
  type: "leaveRoom";
  userId: User["id"];
  roomId: Room["id"];
}

interface DrawEvent extends BaseEvent {
  type: "draw";
  roomId: Room["id"];
  userId: User["id"];
  element: CanvasElement;
}

interface EraseEvent extends BaseEvent {
  type: "erase";
  roomId: Room["id"];
  userId: User["id"];
  elementId: CanvasElement["id"];
}

interface RoomCreatedEvent extends BaseEvent {
  type: "roomCreated";
  userId: User["id"];
  color: User["color"];
  roomId: Room["id"];
  roomName: Room["name"];
}

interface RoomJoinedEvent extends BaseEvent {
  type: "roomJoined";
  userId: User["id"];
  color: User["color"];
  roomName: Room["name"];
  users: User[];
  canvasElements: CanvasElement[];
}

interface AcknowledgeEvent extends BaseEvent {
  // Fire & Forget, so no ID needed
  type: "acknowledge";
  success: boolean;
  message: string;
}

interface UserJoinedEvent extends BaseEvent {
  type: "userJoined";
  newUserId: User["id"];
  name: User["name"];
  color: User["color"];
}

interface CursorMovedEvent extends BaseEvent {
  type: "cursorMoved";
  userId: User["id"];
  position: User["cursor"];
}

interface ColorChangedEvent extends BaseEvent {
  type: "colorChanged";
  userId: User["id"];
  newColor: User["color"];
}

interface UserKickedEvent extends BaseEvent {
  type: "userKicked";
  kickedUserId: User["id"];
}

interface KickedEvent extends BaseEvent {
  type: "kicked";
  userId: User["id"];
}

interface UserLeftEvent extends BaseEvent {
  type: "userLeft";
  userId: User["id"];
}

interface ElementDrawnEvent extends BaseEvent {
  type: "elementDrawn";
  userId: User["id"];
  element: CanvasElement;
}

interface ElementErasedEvent extends BaseEvent {
  type: "elementErased";
  userId: User["id"];
  elementId: CanvasElement["id"];
}

export type ClientEvent =
  | CreateRoomEvent
  | JoinRoomEvent
  | MoveCursorEvent
  | ChangeColorEvent
  | KickUserEvent
  | LeaveRoomEvent
  | DrawEvent
  | EraseEvent;

export type ServerEvent =
  | RoomCreatedEvent
  | RoomJoinedEvent
  | AcknowledgeEvent
  | UserJoinedEvent
  | CursorMovedEvent
  | ColorChangedEvent
  | UserKickedEvent
  | KickedEvent
  | UserLeftEvent
  | ElementDrawnEvent
  | ElementErasedEvent;
