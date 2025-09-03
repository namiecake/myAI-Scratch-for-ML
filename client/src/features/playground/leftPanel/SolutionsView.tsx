import React, { useState } from "react";
import "../playground.css";
import "./Solution.css";
import { ChallengeInfo } from "@/challenges/main";
import { BlockType } from "@/types/block";
import { StandardBlock } from "@/components/blocks/standardBlock";

export const SolutionsView: React.FC<{
  challengeId: string;
}> = ({ challengeId }) => {
  const [selectedSolution, setSelectedSolution] = useState<number>(0);

  const challengeInfo = ChallengeInfo[challengeId];
  if (!challengeInfo) {
    return <div>Challenge not found</div>;
  }

  const metricKeyMapping: Record<string, string> = {
    accuracy_metric: "Accuracy",
    precision_metric: "Precision",
    recall_metric: "Recall",
    f1_score_metric: "F1 Score",
  };

  // Create a dummy block object for the StandardBlock component
  const createDummyBlock = (type: string, index: number) => ({
    id: index,
    type: type as BlockType,
    status: "available" as const,
    allBlocks: {}
  });

  return (
    <div className="solutions-view">
      <div className="solutions-left-column">
        {challengeInfo.solutions.map((solution, index) => {
          return (
            <button
              className={`solution-button ${selectedSolution === index ? "active" : ""}`}
              key={index}
              onClick={() => setSelectedSolution(index)}
            >
              <p className="solution-button-name">{solution.name}</p>
              <p className="solution-button-accuracy">
                {solution.result.accuracy_metric * 100}% Accuracy
              </p>
            </button>
          );
        })}
      </div>
      <div className="solutions-right-column">
        {/* Overview Section */}
        <div className="solution-overview">
          <p>{challengeInfo.solutions[selectedSolution].overview}</p>
        </div>
        {/* The Diagram Model */}
        <table className="metrics-table model-design-table">
          <thead>
            <tr>
              <th>Component</th>
              <th>Block</th>
              <th>Explanation</th>
            </tr>
          </thead>
          <tbody>
            <tr key={"model-blocks"}>
              <td>Model Design</td>
              <td style={{ width: "200px" }}>
                <div className="blocks-container">
                  {challengeInfo.solutions[selectedSolution].diagram.blocks.map((block, index) => (
                    <div key={index} className="block-container">
                      <StandardBlock {...createDummyBlock(block.block_id, index)} />
                    </div>
                  ))}
                </div>
              </td>
              <td>{challengeInfo.solutions[selectedSolution].explanations.model}</td>
            </tr>
            <tr key={"loss-function"}>
              <td>Loss Function</td>
              <td>
                <div className="block-container">
                  <StandardBlock 
                    {...createDummyBlock(
                      challengeInfo.solutions[selectedSolution].diagram.loss_fn,
                      -1
                    )} 
                  />
                </div>
              </td>
              <td>{challengeInfo.solutions[selectedSolution].explanations.loss}</td>
            </tr>
            <tr key={"learning-algorithm"}>
              <td>Learning Algorithm</td>
              <td>
                <div className="block-container">
                  <StandardBlock 
                    {...createDummyBlock(
                      challengeInfo.solutions[selectedSolution].diagram.optimizer,
                      -2
                    )} 
                  />
                </div>
              </td>
              <td>{challengeInfo.solutions[selectedSolution].explanations.optimizer}</td>
            </tr>
          </tbody>
        </table>
        {/* Metrics Table */}
        <table className="metrics-table">
          <thead>
            <tr>
              <th>Metric</th>
              <th>Value (%)</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(challengeInfo.solutions[selectedSolution].result).map(
              ([key, value]) =>
                metricKeyMapping[key] && (
                  <tr key={key}>
                    <td>{metricKeyMapping[key]}</td>
                    <td>{(value * 100).toFixed(2)}</td>
                  </tr>
                )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
