import express from "express";
import { createServer } from "http";
import { type RawData, WebSocket, WebSocketServer } from "ws";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const server = createServer(app);
app.use(express.static("public"));

const PORT = process.env.PORT!;
const BASE_URL = process.env.BASE_URL!;

interface Room {
  roomName: string;
  users: Set<string>;
}

interface User {
  ws: WebSocket;
  userName: string;
  roomId: string;
}

const rooms = new Map<string, Room>();
const users = new Map<string, User>();

enum EVENTS {
  CREATE = "create",
  JOIN = "join",
  LEAVE = "leave",
  // ---------------
  DRAW = "draw",
}

function handleMessage(ws: WebSocket, data: RawData) {
  let message: Record<string, unknown>;
  try {
    message = JSON.parse(data.toString());
  } catch {
    console.error("[WS] Failed to parse message:", data.toString());
    return;
  }
  console.log("[WS] Message received:", message);

  if (message.type === EVENTS.CREATE) {
    const roomName = message.roomName as string;
    const userName = message.userName as string;
    const roomId = crypto.randomUUID();
    const userId = crypto.randomUUID();

    users.set(userId, { ws, userName, roomId });

    const roomUsers = new Set([userId]);
    rooms.set(roomId, { roomName, users: roomUsers });

    console.log(
      `[CREATE] Room "${roomName}" created by "${userName}" (roomId=${roomId}, userId=${userId})`,
    );

    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ roomId, userId }));
    }
  }

  if (message.type === EVENTS.JOIN) {
    const roomId = message.roomId as string;
    const userName = message.userName as string;
    const room = rooms.get(roomId);

    if (!room) {
      console.error(`[JOIN] Room not found: ${roomId}`);
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ error: "Room not found" }));
      }
      return;
    }

    const userId = crypto.randomUUID();
    const roomName = room.roomName;
    users.set(userId, { ws, userName, roomId });

    room.users.add(userId);

    console.log(
      `[JOIN] "${userName}" joined room "${roomName}" (roomId=${roomId}, userId=${userId})`,
    );

    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ roomName, userId }));
    }
  }

  if (message.type === EVENTS.DRAW) {
    const userId = message.userId as string;
    const { timestamp, x, y } = message;

    const sender = users.get(userId);
    if (!sender) return;

    const room = rooms.get(sender.roomId);
    if (!room) return;

    for (const uId of room.users) {
      if (uId === userId) continue;
      const user = users.get(uId);
      if (!user || user.ws.readyState !== WebSocket.OPEN) continue;
      user.ws.send(JSON.stringify({ timestamp, x, y }));
    }
  }
}

const wsServer = new WebSocketServer({ server });
wsServer.on("connection", function connection(wsConnection) {
  console.log("New client connected");

  wsConnection.on("message", function message(data) {
    handleMessage(wsConnection, data);
  });

  wsConnection.on("close", function close() {
    for (const [userId, user] of users) {
      if (user.ws === wsConnection) {
        const room = rooms.get(user.roomId);
        if (room) {
          room.users.delete(userId);
          console.log(
            `[LEAVE] "${user.userName}" left room "${room.roomName}" (roomId=${user.roomId})`,
          );
          if (room.users.size === 0) {
            rooms.delete(user.roomId);
            console.log(`[CLEANUP] Room "${room.roomName}" deleted (empty)`);
          }
        }
        users.delete(userId);
        break;
      }
    }
    console.log("[WS] Client disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`Server running on ${BASE_URL}:${PORT}`);
});
