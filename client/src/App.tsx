import { useState } from "react";
import type { Screen } from "./types/app";
import { WsProvider } from "./providers/WsProvider";
import HomeScreen from "./screens/HomeScreen";
import RoomScreen from "./screens/RoomScreen";

function AppContent() {
  const [screen, setScreen] = useState<Screen>("home");

  if (screen === "room") {
    return <RoomScreen onLeave={() => setScreen("home")} />;
  }

  return <HomeScreen onEnterRoom={() => setScreen("room")} />;
}

export default function App() {
  return (
    <WsProvider>
      <AppContent />
    </WsProvider>
  );
}
