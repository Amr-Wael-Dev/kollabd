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

const wsServer = new WebSocketServer({ server });
wsServer.on("connection", function connection(wsConnection) {
  wsConnection.on("message", function message(data) {
    console.log(data);
  });

  wsConnection.on("close", function close() {});
});

server.listen(PORT, () => {
  console.log(`Server running on ${BASE_URL}:${PORT}`);
});
