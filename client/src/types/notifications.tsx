// Types
export interface Notification {
  id: string;
  message: string;
  type?: "error" | "warning" | "success" | "info";
  layer?: number;
}

export interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id">) => void;
  removeNotification: (id: string) => void;
}

// Notification Item Component
export interface NotificationItemProps {
  notification: Notification;
  onClose: (id: string) => void;
  index: number;
}
