import type React from "react";
import { cn } from "@/utils/cn";

interface BadgeProps {
  variant?: "default" | "secondary" | "destructive";
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ variant = "default", children }) => {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        {
          "bg-primary text-primary-foreground hover:bg-primary/80": variant === "default",
          "bg-secondary text-secondary-foreground hover:bg-secondary/80": variant === "secondary",
          "bg-destructive text-destructive-foreground hover:bg-destructive/80":
            variant === "destructive",
        }
      )}
    >
      {children}
    </span>
  );
};
