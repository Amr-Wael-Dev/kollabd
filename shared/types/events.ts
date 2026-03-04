export const EVENTS = {
  CREATE: "create",
  JOIN: "join",
  LEAVE: "leave",
  DRAW: "draw",
} as const;

export type EventType = (typeof EVENTS)[keyof typeof EVENTS];

export interface CreateMessage {
  type: typeof EVENTS.CREATE;
  roomName: string;
  userName: string;
}

export interface JoinMessage {
  type: typeof EVENTS.JOIN;
  roomId: string;
  userName: string;
}

export interface DrawMessage {
  type: typeof EVENTS.DRAW;
  userId: string;
  timestamp: string;
  x: number;
  y: number;
}

export type ClientMessage = CreateMessage | JoinMessage | DrawMessage;

export interface CreateResponse {
  roomId: string;
  userId: string;
}

export interface JoinResponse {
  roomName: string;
  userId: string;
}

export interface ErrorResponse {
  error: string;
}

export interface DrawBroadcast {
  timestamp: string;
  x: number;
  y: number;
}

export type ServerMessage =
  | CreateResponse
  | JoinResponse
  | ErrorResponse
  | DrawBroadcast;
