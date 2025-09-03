import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import "./profileButton.css";

export const ProfileButton: React.FC<{
  backgroundColor?: string;
  iconColor?: string;
}> = ({ backgroundColor = "#666666", iconColor = "#ffffff" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push("/signin");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const containerStyle: React.CSSProperties = {
    // position: "absolute",
    top: "10px",
    right: "20px",
    zIndex: 1000,
  };

  const buttonStyle: React.CSSProperties = {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: backgroundColor,
    borderWidth: 0,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
    color: iconColor,
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  };

  const dropdownStyle: React.CSSProperties = {
    position: "absolute",
    top: "50px",
    right: "0",
    backgroundColor: "#f8f8f8",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#e0e0e0",
    borderRadius: "12px",
    padding: "12px",
    minWidth: "220px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    display: isOpen ? "block" : "none",
  };

  const dropdownItemStyle: React.CSSProperties = {
    padding: "10px 12px",
    color: "#555555",
    fontSize: "0.9em",
    fontWeight: 500,
    borderRadius: "6px",
    backgroundColor: "#ffffff",
    marginTop: 0,
    marginRight: 0,
    marginBottom: "8px",
    marginLeft: 0,
  };

  const logoutButtonStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    marginTop: "8px",
    borderWidth: 0,
    borderTopWidth: "1px",
    borderTopStyle: "solid",
    borderTopColor: "#e0e0e0",
    backgroundColor: "transparent",
    cursor: "pointer",
    textAlign: "left",
    color: "#dc3545",
    fontSize: "0.9em",
    fontWeight: 1000,
    borderRadius: "6px",
    transition: "all 0.2s ease",
  };

  return (
    <div style={containerStyle} ref={dropdownRef}>
      <button
        className="profile-button"
        style={buttonStyle}
        onClick={() => setIsOpen(!isOpen)}
        title="Profile"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{ opacity: 0.9 }}
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </button>

      <div style={dropdownStyle}>
        <div style={dropdownItemStyle}>
          <strong>User:</strong> {user?.email || "Not signed in"}
        </div>
        <button className="logout-button" style={logoutButtonStyle} onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};
