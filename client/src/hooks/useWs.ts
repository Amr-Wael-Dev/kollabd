import type { Room } from "@kollabd/shared";
import { createContext, use } from "react";

interface WsContextValue {
  isConnected: boolean;
  currentUserId: string | null;
  currentUserColor: string | null;
  room: Room | null;
  createRoom: (userName: string, roomName: string) => Promise<void>;
  joinRoom: (userName: string, roomId: string) => Promise<void>;
  leaveRoom: () => void;
  kickUser: (userId: string) => void;
  disconnect: () => void;
}

export const WsContext = createContext<WsContextValue | null>(null);

export function useWs() {
  const context = use(WsContext);
  if (!context) {
    throw new Error("useWs must be used within a WsProvider");
  }
  return context;
}
