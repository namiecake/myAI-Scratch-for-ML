"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import useWebSocket from "@/services/WebSocket";

interface WebSocketContextType {
  messages: string[];
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<string[]>([]);

  // Pass a callback to update messages in context
  useWebSocket((newMessage: string) => {
    setMessages((prev) => [...prev, newMessage]);
  });

  return <WebSocketContext.Provider value={{ messages }}>{children}</WebSocketContext.Provider>;
};

// Custom hook to use WebSocket context
export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocketContext must be used within a WebSocketProvider");
  }
  return context;
};
