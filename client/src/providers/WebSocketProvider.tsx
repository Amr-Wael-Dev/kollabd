import { useState, type ReactNode } from "react";
import { WebSocketContext } from "../hooks/useWebSocket";

export default function WebSocketProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [webSocket, setWebSocket] = useState<WebSocket | null>(null);

  return (
    <WebSocketContext value={{ webSocket, setWebSocket }}>
      {children}
    </WebSocketContext>
  );
}
