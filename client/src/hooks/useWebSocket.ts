import { createContext, use } from "react";

interface WebSocketContextValue {
  webSocket: WebSocket | null;
  setWebSocket: (ws: WebSocket | null) => void;
}

export const WebSocketContext = createContext<WebSocketContextValue | null>(
  null,
);

export function useWebSocket() {
  const context = use(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
}
