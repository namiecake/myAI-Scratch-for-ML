import React from "react";
import "./playgroundheader.css";
import { ProfileButton } from "@/components/ProfileButton";
import { useRouter } from "next/navigation";

export default function PlaygroundHeader() {
  const router = useRouter();

  // Handle challenge click
  const handleHomeClick = () => {
    router.push(`/`);
  };

  return (
    <div className="playground-header-container">
      <button onClick={handleHomeClick} className="home-button">
        myAI
      </button>

      <ProfileButton backgroundColor="var(--white)" iconColor="var(--light-blue)" />
    </div>
  );
}
