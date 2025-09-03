import React from "react";
import "./home.css";
import { ProfileButton } from "@/components/ProfileButton";
import { ChallengeInfo } from "@/challenges/challenge";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  // Handle challenge click
  const handleChallengeClick = (slug: string) => {
    router.push(`/challenge/${slug}`);
  };

  return (
    <div className="app-container">
      {/* Top navigation bar */}
      <header className="app-header">
        <div className="header-container">
          <h1 className="app-title">myAI</h1>
          <ProfileButton backgroundColor="var(--white)" iconColor="var(--light-blue)" />
        </div>
      </header>

      {/* Main content */}
      <main className="home-main-content">
        <div className="welcome-section">
          <h2 className="welcome-title">Welcome to myAI</h2>
          <p className="welcome-text">Select a challenge below.</p>
        </div>

        {/* Challenge filters
        <div className="filter-container">
          <button className="filter-button active">All</button>
          <button className="filter-button">Beginner</button>
          <button className="filter-button">Intermediate</button>
          <button className="filter-button">Advanced</button>
        </div> */}

        {/* Challenges list */}
        <div className="challenges-grid">
          {Object.entries(ChallengeInfo).map(([challengeName, challenge]) => (
            <div
              key={challengeName}
              onClick={() => handleChallengeClick(challenge.slug)}
              className="challenge-card"
            >
              <div className="challenge-content">
                <div className="challenge-header">
                  <h3 className="challenge-title">{challenge.title}</h3>
                </div>
                <p className="challenge-description">{challenge.description}</p>
                <div className="challenge-meta">
                  <span className={`difficulty-badge ${challenge.difficulty.toLowerCase()}`}>
                    {challenge.difficulty}
                  </span>
                  <span className="time-estimate">~{challenge.estimatedTime} minutes</span>
                </div>
                <div className="tag-container">
                  {challenge.tags.map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p className="footer-text">© 2025 myAI - Build your own artificial intelligences</p>
      </footer>
    </div>
  );
}
