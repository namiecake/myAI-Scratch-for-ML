import React, { useState } from "react";
import { Blocks } from "@/types/block";
import { DiagramType } from "@/types/diagram";
import { helperStatements } from "@/utils/helperStatements";
import { buildDiagram } from "@/utils/blockapiSchema";
import { TrainingStatus } from "@/types/training";
import { InfoButton } from '@/components/InfoButton';
import { IoMdBulb } from "react-icons/io";
import { IoBulbOutline } from "react-icons/io5";

interface HelperSectionProps {
  droppedBlocks?: Blocks;
  trainingStatus: TrainingStatus;
}

export const HelperSection: React.FC<HelperSectionProps> = ({ droppedBlocks = {}, trainingStatus }) => {
  const [isContentVisible, setIsContentVisible] = useState(true);
  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    height: isContentVisible ? "100%" : "auto",
    color: "var(--text-color)",
    padding: "1rem",
    backgroundColor: "var(--background-color)",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  };

  const headerStyle: React.CSSProperties = {
    fontSize: "1.1em",
    fontWeight: "bold",
    marginBottom: isContentVisible ? "1rem" : "0",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    justifyContent: "space-between",
  };

  const toggleButtonStyle: React.CSSProperties = {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "4px",
    display: "flex",
    alignItems: "center",
    color: "var(--text-color)",
    fontSize: "1.3em",
    transition: "opacity 0.2s, color 0.2s",
  };

  const messageStyle: React.CSSProperties = {
    color: "var(--text-color)",
    marginBottom: "1rem",
    fontSize: "1em",
    lineHeight: "1.6",
    padding: "0 8px",
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
  };

  const successStyle: React.CSSProperties = {
    color: "var(--success-color, #51cf66)",
    marginBottom: "1rem",
    fontSize: "1em",
    lineHeight: "1.6",
    padding: "0 8px",
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
  };

  // Check for errors based on current state
  const getTrainResult = () => {
    // First check if there are any blocks at all
    if (!droppedBlocks || Object.keys(droppedBlocks).length === 0) {
      return {
        error: true,
        errorMessage: "👋 Welcome! Let's start by dragging in a 'When train clicked' block",
      };
    }

    try {
      const blockData: DiagramType = buildDiagram(droppedBlocks, "");
      return helperStatements(blockData, droppedBlocks, trainingStatus);
    } catch {
      return {
        error: true,
        errorMessage: "Oops! There was an error analyzing your blocks. Let's try that again.",
      };
    }
  };

  const trainResult = getTrainResult();

  return (
    <div style={containerStyle}>
      <h3 style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            style={toggleButtonStyle}
            onClick={() => setIsContentVisible(!isContentVisible)}
            title={isContentVisible ? "Hide helper" : "Show helper"}
          >
            {isContentVisible ? <IoMdBulb style={{ color: "#FFD700" }}/> : <IoBulbOutline />}
          </button>
          Interactive Helper
        </div>
        <InfoButton
          content={
            <>
              The Interactive Helper guides you through building your machine learning model. It provides real-time feedback on your block configuration and helps ensure your model is properly set up before training.
              <br/><br/>
              If you don't want help press the lightbulb button to hide the interactive helper comments.
            </>
        }
        />
      </h3>
      {isContentVisible ? (
        <>
          {trainResult.error ? (
            <div style={messageStyle}>
              {trainResult.errorMessage}
            </div>
          ) : (
            <div style={successStyle}>
              <span role="img" aria-label="checkmark">✅</span>
              Great job! Your model is ready for training. Click the train button to start!
            </div>
          )}
        </>
      ) : (
        <div style={{ ...messageStyle, color: 'var(--text-color)', opacity: 0.7, fontSize: '0.9em' }}>
          If you want additional help press the lightbulb!
        </div>
      )}
    </div>
  );
};
