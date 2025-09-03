"use client";

import DatabaseService from "@/services/Database";
import { createContext, useState, useEffect, useContext } from "react";

// Create the Context for user data
interface UserContextType {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  userData: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateUserData: (data: any) => void;
}
const UserContext = createContext<UserContextType | undefined>(undefined);

// Custom hook to use the UserContext
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useWebSocketContext must be used within a WebSocketProvider");
  }
  return context;
};

interface UserProviderProps {
  children: React.ReactNode;
}

// UserContext Provider component
export const UserProvider = ({ children }: UserProviderProps) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [userData, setUserData] = useState<any>();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateUserData = (data: any) => {
    setUserData(data);
  };
  useEffect(() => {
    DatabaseService.retrieveUserData().then((response) => {
      setUserData(response);
    });
  }, []);

  return (
    <UserContext.Provider value={{ userData, updateUserData }}>{children}</UserContext.Provider>
  );
};
