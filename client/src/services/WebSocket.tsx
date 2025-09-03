import { auth } from "@/lib/firebase";
import { useEffect, useRef } from "react";

const useWebSocket = (onMessage: (message: string) => void) => {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const isTabActive = useRef(true);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleVisibilityChange = () => {
      isTabActive.current = document.visibilityState === "visible";
      if (isTabActive.current && !wsRef.current) {
        connectWebSocket();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const connectWebSocket = () => {
    const user_id = auth.currentUser?.uid;
    if (!user_id) return;

    const WEB_SOCKET_URL = `https://client-server-590321385188.us-west1.run.app/updates-ws/${user_id}`;
    const ws = new WebSocket(WEB_SOCKET_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("Connected to WebSocket");
      reconnectAttempts.current = 0;
    };

    ws.onmessage = (event) => {
      onMessage(event.data); // Call the callback to update context state
    };

    ws.onerror = (error) => {
      console.log("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket closed");
      wsRef.current = null;

      if (isTabActive.current) {
        const delay = Math.min(5000, 1000 * 2 ** reconnectAttempts.current);
        reconnectTimeout.current = setTimeout(() => {
          reconnectAttempts.current += 1;
          connectWebSocket();
        }, delay);
      }
    };
  };

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
    };
  }, []);
};

export default useWebSocket;
