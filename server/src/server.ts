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

const rooms = new Map();
const users = new Map();

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
    const { roomName, userName } = message;
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
    const { roomId, userName } = message;
    const room = rooms.get(roomId as string);

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
    const { userId, timestamp, x, y } = message;
    const room = rooms.get(users.get(userId).roomId);
    const roomUsersWithoutSender = Array.from(room.users).filter(
      (uId) => uId !== userId,
    );
    for (const uId of roomUsersWithoutSender) {
      const user = users.get(uId);
      const userWs = user.ws;

      if (userWs.readyState === WebSocket.OPEN) {
        userWs.send(JSON.stringify({ timestamp, x, y }));
      }
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
