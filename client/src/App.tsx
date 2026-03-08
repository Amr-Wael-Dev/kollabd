import { useState } from "react";
import type { Screen } from "./types/app";
import HomeScreen from "./screens/HomeScreen";
import RoomScreen from "./screens/RoomScreen";

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");

  if (screen === "room") {
    return <RoomScreen onLeave={() => setScreen("home")} />;
  }

  return <HomeScreen onEnterRoom={() => setScreen("room")} />;
}
