import {
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import type {
  Room,
  User,
  BaseEvent,
  CreateRoomEvent,
  JoinRoomEvent,
  LeaveRoomEvent,
  KickUserEvent,
  RoomCreatedEvent,
  RoomJoinedEvent,
  UserJoinedEvent,
  UserLeftEvent,
  UserKickedEvent,
  AcknowledgeEvent,
  MoveCursorEvent,
  CursorMovedEvent,
  DrawEvent,
  ElementDrawnEvent,
  CanvasElement,
} from "@kollabd/shared";
import { toast } from "sonner";
import { WsContext } from "../hooks/useWs";

const WS_URL = import.meta.env.VITE_WS_URL;

export function WsProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserColor, setCurrentUserColor] = useState<string | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const pendingAction = useRef<{
    resolve: () => void;
    reject: (error: Error) => void;
  } | null>(null);

  const send = useCallback((event: BaseEvent) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(event));
    } else {
      toast.error("Not connected to server");
    }
  }, []);

  const handleEvent = useCallback((event: BaseEvent) => {
    switch (event.type) {
      case "roomCreated": {
        const e = event as RoomCreatedEvent;
        setCurrentUserId(e.userId);
        setCurrentUserColor(e.color);
        setRoom({
          id: e.roomId,
          name: e.roomName,
          adminId: e.userId,
          users: [
            {
              id: e.userId,
              name: e.userName,
              color: e.color,
              cursor: { x: 0, y: 0 },
            },
          ],
          canvasElements: [],
        });
        toast.success(`Room "${e.roomName}" created!`);
        pendingAction.current?.resolve();
        pendingAction.current = null;
        break;
      }

      case "roomJoined": {
        const e = event as RoomJoinedEvent;
        setCurrentUserId(e.userId);
        setCurrentUserColor(e.color);
        setRoom({
          id: e.roomId,
          name: e.roomName,
          adminId: e.adminId,
          users: e.users,
          canvasElements: e.canvasElements,
        });
        toast.success(`Joined room "${e.roomName}"!`);
        pendingAction.current?.resolve();
        pendingAction.current = null;
        break;
      }

      case "userJoined": {
        const e = event as UserJoinedEvent;
        setRoom((prev) => {
          if (!prev) return prev;
          const newUser: User = {
            id: e.newUserId,
            name: e.newUserName,
            color: e.color,
            cursor: { x: 0, y: 0 },
          };
          return {
            ...prev,
            users: [...prev.users, newUser],
          };
        });
        toast.info(`${e.newUserName} joined the room`);
        break;
      }

      case "userLeft": {
        const e = event as UserLeftEvent;
        setRoom((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            users: prev.users.filter((u) => u.id !== e.userId),
          };
        });
        break;
      }

      case "userKicked": {
        const e = event as UserKickedEvent;
        setRoom((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            users: prev.users.filter((u) => u.id !== e.kickedUserId),
          };
        });
        toast.info("A user was kicked from the room");
        break;
      }

      case "kicked": {
        setRoom(null);
        setCurrentUserId(null);
        setCurrentUserColor(null);
        toast.error("You have been kicked from the room");
        break;
      }

      case "acknowledge": {
        const e = event as AcknowledgeEvent;
        if (!e.success) {
          toast.error(e.message);
        }
        break;
      }

      case "cursorMoved": {
        const e = event as CursorMovedEvent;
        setRoom((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            users: prev.users.map((user) =>
              user.id === e.userId ? { ...user, cursor: e.position } : user,
            ),
          };
        });
        break;
      }

      case "elementDrawn": {
        const e = event as ElementDrawnEvent;
        setRoom((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            canvasElements: [...prev.canvasElements, e.element],
          };
        });
        break;
      }

      default:
        console.log("Unhandled event:", event);
    }
  }, []);

  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      console.log("WebSocket connected");
    };

    ws.onclose = () => {
      setIsConnected(false);
      console.log("WebSocket disconnected");
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      toast.error("Connection error");
    };

    ws.onmessage = (event) => {
      try {
        const data: BaseEvent = JSON.parse(event.data);
        handleEvent(data);
      } catch (error) {
        console.error("Failed to parse message:", error);
      }
    };

    return () => {
      ws.close();
    };
  }, [handleEvent]);

  const createRoom = useCallback(
    (userName: string, roomName: string) => {
      return new Promise<void>((resolve, reject) => {
        pendingAction.current = { resolve, reject };
        const event: CreateRoomEvent = {
          type: "create",
          userName,
          roomName,
          timestamp: Date.now(),
        };
        send(event);
      });
    },
    [send],
  );

  const joinRoom = useCallback(
    (userName: string, roomId: string) => {
      return new Promise<void>((resolve, reject) => {
        pendingAction.current = { resolve, reject };
        const event: JoinRoomEvent = {
          type: "join",
          userName,
          roomId,
          timestamp: Date.now(),
        };
        send(event);
      });
    },
    [send],
  );

  const leaveRoom = useCallback(() => {
    if (!room || !currentUserId) return;

    const event: LeaveRoomEvent = {
      type: "leaveRoom",
      userId: currentUserId,
      roomId: room.id,
      timestamp: Date.now(),
    };
    send(event);
    setRoom(null);
    setCurrentUserId(null);
    setCurrentUserColor(null);
    toast("You left the room");
  }, [room, currentUserId, send]);

  const kickUser = useCallback(
    (userId: string) => {
      if (!room || !currentUserId) return;

      const event: KickUserEvent = {
        type: "kickUser",
        userId: currentUserId,
        roomId: room.id,
        kickedUserId: userId,
        timestamp: Date.now(),
      };
      send(event);
    },
    [room, currentUserId, send],
  );

  const disconnect = useCallback(() => {
    wsRef.current?.close();
  }, []);

  const moveCursor = useCallback(
    (position: User["cursor"]) => {
      if (!room || !currentUserId) return;

      const event: MoveCursorEvent = {
        type: "moveCursor",
        userId: currentUserId,
        roomId: room.id,
        position,
        timestamp: Date.now(),
      };
      send(event);
    },
    [room, currentUserId, send],
  );

  const draw = useCallback(
    (element: CanvasElement) => {
      if (!room || !currentUserId) return;

      const event: DrawEvent = {
        type: "draw",
        userId: currentUserId,
        roomId: room.id,
        element,
        timestamp: Date.now(),
      };
      send(event);

      // Optimistically add the element to local state
      setRoom((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          canvasElements: [...prev.canvasElements, element],
        };
      });
    },
    [room, currentUserId, send],
  );

  return (
    <WsContext
      value={{
        isConnected,
        currentUserId,
        currentUserColor,
        room,
        createRoom,
        joinRoom,
        leaveRoom,
        kickUser,
        disconnect,
        moveCursor,
        draw,
      }}
    >
      {children}
    </WsContext>
  );
}
