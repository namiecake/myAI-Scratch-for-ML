import React, { useEffect } from "react";
import { AlertTriangle, CheckCircle, Info, AlertCircle } from "lucide-react";
import { useWebSocketContext } from "@/contexts/WebSocketContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { NotificationItemProps } from "@/types/notifications";

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onClose, index }) => {
  const { id, message, type = "error", layer } = notification;

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case "info":
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStyles = () => {
    const baseStyles = "border-2 rounded-lg p-4 max-w-md mx-auto shadow-lg cursor-pointer ";
    switch (type) {
      case "success":
        return baseStyles + "bg-green-100 border-green-500";
      case "warning":
        return baseStyles + "bg-yellow-100 border-yellow-500";
      case "info":
        return baseStyles + "bg-blue-100 border-blue-500";
      default:
        return baseStyles + "bg-red-100 border-red-500";
    }
  };

  return (
    <div
      className="fixed left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top duration-300"
      style={{ top: `${1 + index * 4}rem`, zIndex: 1000 }}
      onClick={() => onClose(id)}
    >
      <div className={getStyles()}>
        <div className="flex items-start gap-2">
          {getIcon()}
          <div>
            <p
              className={`font-medium ${
                type === "error"
                  ? "text-red-700"
                  : type === "success"
                  ? "text-green-700"
                  : type === "warning"
                  ? "text-yellow-700"
                  : "text-blue-700"
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
              {layer !== undefined && ` in Layer ${layer}`}
            </p>
            <p
              className={`text-sm mt-1 ${
                type === "error"
                  ? "text-red-600"
                  : type === "success"
                  ? "text-green-600"
                  : type === "warning"
                  ? "text-yellow-600"
                  : "text-blue-600"
              }`}
            >
              
              {message}
              <span
                className={`block text-xs italic ${
                  type === "error"
                    ? "text-red-600"
                    : type === "success"
                    ? "text-green-600"
                    : type === "warning"
                    ? "text-yellow-600"
                    : "text-blue-600"
                }`}
              >
                {"(Click to close this notification)"}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Stack Component
export const NotificationStack: React.FC = () => {
  const { notifications, removeNotification } = useNotifications();

  return (
    <>
      {notifications.map((notification, index) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClose={removeNotification}
          index={index}
        />
      ))}
    </>
  );
};

export const WebsocketNotification: React.FC = () => {
  const { addNotification } = useNotifications();
  const { messages } = useWebSocketContext();

  useEffect(() => {
    if (messages.length === 0) return;

    const latestMessage = messages[messages.length - 1];
    let parsedData;
    try {
      parsedData = typeof latestMessage === "string" ? JSON.parse(latestMessage) : latestMessage;
    } catch (error) {
      console.error("Error parsing websocket message:", error);
      return;
    }

    if (parsedData.update_type === "result" && parsedData.stop_training === false) {
      addNotification({
        message: `Training completed with accuracy: ${parsedData.metrics.accuracy_metric}`,
        type: "success",
      });
    } else if (parsedData.update_type === "error") {
      addNotification({
        message: parsedData.message,
        type: "error",
        layer: parsedData.layer,
      });
    } else if (parsedData.update_type === "warning") {
      addNotification({
        message: parsedData.message,
        type: "warning",
        layer: parsedData.layer,
      });
    }
  }, [messages, addNotification]);

  return null;
};
