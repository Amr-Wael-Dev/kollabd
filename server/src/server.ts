import express from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const server = createServer(app);

app.use(express.static("public"));

const PORT = process.env.PORT!;
const BASE_URL = process.env.BASE_URL!;

const wss = new WebSocketServer({ server });

wss.on("connection", function connection(ws) {
  console.log("New client connected");

  ws.on("message", function message(data) {
    const messageText = data.toString();
    console.log("Received:", messageText);
    ws.send(`Echo: ${messageText}`);
  });

  ws.on("close", function close() {
    console.log("Client disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`Server running on ${BASE_URL}:${PORT}`);
});
