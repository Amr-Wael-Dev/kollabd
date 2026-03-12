import express from "express";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import dotenv from "dotenv";
import {
  AcknowledgeEvent,
  BaseEvent,
  CreateRoomEvent,
  JoinRoomEvent,
  KickUserEvent,
  LeaveRoomEvent,
  Room,
  RoomCreatedEvent,
  RoomJoinedEvent,
  User,
  UserJoinedEvent,
  UserKickedEvent,
  KickedEvent,
  UserLeftEvent,
  MoveCursorEvent,
  CursorMovedEvent,
} from "@kollabd/shared";

type ServerUser = User & {
  ws: WebSocket;
  roomId?: string;
};

type ServerRoom = Omit<Room, "users"> & {
  users: User["id"][];
};

dotenv.config();

const app = express();
const server = createServer(app);
const wsServer = new WebSocketServer({ server });

app.use(express.static("public"));

const PORT = process.env.PORT!;
const BASE_URL = process.env.BASE_URL!;

const users = new Map<User["id"], ServerUser>();
const rooms = new Map<Room["id"], ServerRoom>();

function getRandomColor(excludeColors: string[] = []): User["color"] {
  const colors = ["#e74c3c", "#3498db", "#2ecc71", "#f39c12", "#9b59b6"];
  const availableColors = colors.filter((c) => !excludeColors.includes(c));

  // If all colors are used, return a random one from the full list
  if (availableColors.length === 0) {
    return colors[Math.floor(Math.random() * colors.length)];
  }

  return availableColors[Math.floor(Math.random() * availableColors.length)];
}

function getUsedColorsInRoom(roomId: string): string[] {
  const room = rooms.get(roomId);
  if (!room) return [];

  return room.users
    .map((userId) => users.get(userId)?.color)
    .filter((color): color is string => color !== undefined);
}

function send(ws: WebSocket, event: BaseEvent) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(event));
  }
}

function sendAck(ws: WebSocket, success: boolean, message: string) {
  send(ws, {
    type: "acknowledge",
    success,
    message,
    timestamp: Date.now(),
  } as AcknowledgeEvent);
}

function broadcast(roomId: string, event: BaseEvent, excludeUserId?: string) {
  const room = rooms.get(roomId);
  if (!room) return;

  for (const userId of room.users) {
    if (userId === excludeUserId) continue;

    const user = users.get(userId);
    if (!user) continue;

    send(user.ws, event);
  }
}

function createUser(ws: WebSocket, name: string, roomId?: string): ServerUser {
  const id = crypto.randomUUID();
  const usedColors = roomId ? getUsedColorsInRoom(roomId) : [];

  const user: ServerUser = {
    id,
    name,
    ws,
    color: getRandomColor(usedColors),
    cursor: { x: 0, y: 0 },
  };

  users.set(id, user);
  return user;
}

function createRoom(ws: WebSocket, event: CreateRoomEvent) {
  const user = createUser(ws, event.userName);
  const roomId = crypto.randomUUID();

  user.roomId = roomId;

  rooms.set(roomId, {
    id: roomId,
    name: event.roomName,
    adminId: user.id,
    canvasElements: [],
    users: [user.id],
  });

  const response: RoomCreatedEvent = {
    type: "roomCreated",
    roomId,
    roomName: event.roomName,
    userId: user.id,
    userName: user.name,
    color: user.color,
    timestamp: event.timestamp,
  };

  send(ws, response);
}

function joinRoom(ws: WebSocket, event: JoinRoomEvent) {
  const room = rooms.get(event.roomId);
  if (!room) throw new Error("Room not found");

  const newUser = createUser(ws, event.userName, event.roomId);
  newUser.roomId = event.roomId;

  room.users.push(newUser.id);

  const usersInRoom = room.users
    .map((id) => users.get(id))
    .filter(Boolean)
    .map(
      (user) =>
        ({
          color: user?.color,
          cursor: user?.cursor,
          id: user?.id,
          name: user?.name,
        }) as User,
    );

  const response: RoomJoinedEvent = {
    type: "roomJoined",
    roomId: room.id,
    userId: newUser.id,
    color: newUser.color,
    roomName: room.name,
    adminId: room.adminId,
    users: usersInRoom,
    canvasElements: room.canvasElements,
    timestamp: event.timestamp,
  };

  send(ws, response);

  const joinEvent: UserJoinedEvent = {
    type: "userJoined",
    newUserId: newUser.id,
    newUserName: newUser.name,
    color: newUser.color,
    timestamp: Date.now(),
  };

  broadcast(event.roomId, joinEvent, newUser.id);
}

function leaveRoom(event: LeaveRoomEvent) {
  const room = rooms.get(event.roomId);
  if (!room) throw new Error("Room not found");

  const userIndex = room.users.indexOf(event.userId);
  if (userIndex === -1) throw new Error("User not in room");

  room.users.splice(userIndex, 1);
  users.delete(event.userId);

  const userLeftEvent: UserLeftEvent = {
    type: "userLeft",
    userId: event.userId,
    timestamp: event.timestamp,
  };

  broadcast(event.roomId, userLeftEvent);

  if (room.users.length === 0) {
    rooms.delete(event.roomId);
  }
}

function kickUser(ws: WebSocket, event: KickUserEvent) {
  const room = rooms.get(event.roomId);
  if (!room) throw new Error("Room not found");

  if (room.adminId !== event.userId) {
    throw new Error("Only admin can kick users");
  }

  const index = room.users.indexOf(event.kickedUserId);
  if (index === -1) throw new Error("User not in room");

  room.users.splice(index, 1);

  const kickedUser = users.get(event.kickedUserId);
  if (kickedUser) {
    const kickedEvent: KickedEvent = {
      type: "kicked",
      userId: event.kickedUserId,
      timestamp: Date.now(),
    };

    send(kickedUser.ws, kickedEvent);
  }

  users.delete(event.kickedUserId);

  const broadcastEvent: UserKickedEvent = {
    type: "userKicked",
    kickedUserId: event.kickedUserId,
    timestamp: Date.now(),
  };

  broadcast(event.roomId, broadcastEvent);

  sendAck(ws, true, `User ${event.kickedUserId} kicked`);
}

function moveCursor(ws: WebSocket, event: MoveCursorEvent) {
  const user = users.get(event.userId);
  if (!user) return;

  // Update user's cursor position
  user.cursor = event.position;

  // Broadcast cursor movement to other users in the room
  const cursorMovedEvent: CursorMovedEvent = {
    type: "cursorMoved",
    userId: event.userId,
    position: event.position,
    timestamp: event.timestamp,
  };

  broadcast(event.roomId, cursorMovedEvent, event.userId);
}

function handleDisconnect(ws: WebSocket) {
  let userId: string | undefined;

  for (const [id, user] of users) {
    if (user.ws === ws) {
      userId = id;
      break;
    }
  }

  if (!userId) return;

  const user = users.get(userId);
  if (!user?.roomId) {
    users.delete(userId);
    return;
  }

  const room = rooms.get(user.roomId);
  if (!room) return;

  const index = room.users.indexOf(userId);
  if (index !== -1) room.users.splice(index, 1);

  users.delete(userId);

  const event: UserLeftEvent = {
    type: "userLeft",
    userId,
    timestamp: Date.now(),
  };

  broadcast(user.roomId, event);

  if (room.users.length === 0) {
    rooms.delete(user.roomId);
  }
}

wsServer.on("connection", (ws) => {
  console.log("WS connected");

  ws.on("message", (data) => {
    try {
      const event: BaseEvent = JSON.parse(data.toString());
      switch (event.type) {
        case "create":
          createRoom(ws, event as CreateRoomEvent);
          break;

        case "join":
          joinRoom(ws, event as JoinRoomEvent);
          break;

        case "leaveRoom":
          leaveRoom(event as LeaveRoomEvent);
          break;

        case "kickUser":
          kickUser(ws, event as KickUserEvent);
          break;

        case "moveCursor":
          moveCursor(ws, event as MoveCursorEvent);
          break;

        default:
          sendAck(ws, false, `Unknown event: ${event.type}`);
      }
    } catch (error) {
      console.error("An Error Occured:", error);
      sendAck(ws, false, "Invalid message format");
    }
  });

  ws.on("close", () => {
    handleDisconnect(ws);
  });

  ws.on("error", (err) => {
    console.error("WebSocket error:", err);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on ${BASE_URL}:${PORT}`);
});
