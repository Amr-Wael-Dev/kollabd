import { ToastContainer } from "react-toastify";
import WebSocketProvider from "./providers/WebSocketProvider";
import ScreenManager from "./components/ScreenManager";

export default function App() {
  return (
    <WebSocketProvider>
      <ScreenManager />
      <ToastContainer position="top-center" autoClose={3000} />
    </WebSocketProvider>
  );
}
