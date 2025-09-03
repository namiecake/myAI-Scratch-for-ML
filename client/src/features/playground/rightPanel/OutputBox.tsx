import React, { useState } from "react";
import { EvaluateStatus, TrainingStatus } from "@/types/training";
import { Blocks } from "@/types/block";
import { DisplayedMetrics } from "@/types/diagram";
import { ModelOutputGrid } from "../../../challenges/binary_classification/modelOutputContent";
import { WeatherModelOutputGrid } from "../../../challenges/weather_classification/weatherModelOutputContent";
import { ChallengeType } from "@/challenges/challenge";
import "../playground.css";
import { InfoButton } from '@/components/InfoButton';
import "./RightPanel.css";

interface OutputBoxProps {
  trainingStatus: TrainingStatus;
  evaluateStatus: EvaluateStatus;
  metrics: DisplayedMetrics | null;
  blocks: Blocks;
  challengeType: ChallengeType;
}

export const OutputBox: React.FC<OutputBoxProps> = ({
  trainingStatus,
  metrics,
  evaluateStatus,
  blocks,
  challengeType,
}) => {
  const [activeTab, setActiveTab] = useState<"metrics" | "visual">("metrics");

  const getEvaluationMessage = () => {
    if (trainingStatus !== "result") {
      return "Finishing training to enable evaluation";
    }
    return "Click the Evaluate button to see your results";
  };

  const getPerformanceMessage = () => {
    const accuracy = metrics?.accuracy ? metrics.accuracy * 100 : 0;

    if (accuracy >= 99) {
      return { message: "🔥 Outstanding! You're among the best!", color: "green" };
    } else if (accuracy >= 95) {
      return { message: "😊 Great job! You're almost in the top category.", color: "blue" };
    } else if (accuracy >= 90) {
      return {
        message: "👍 Good work! A bit of improvement can take you further.",
        color: "orange",
      };
    } else {
      return { message: "🚨 Keep going! Review your model for improvements.", color: "red" };
    }
  };

  const performance = getPerformanceMessage();

  // Define the metrics to display dynamically
  const evalStartBlock = Object.values(blocks).find((block) => block.type === "load_metrics");
  const metricsToDisplay: Map<string, number> = new Map<string, number>();

  if (evalStartBlock && evalStartBlock.internalIds) {
    for (const id of evalStartBlock.internalIds) {
      const blockType = blocks[id]?.type;

      if (!blockType) continue;

      switch (blockType) {
        case "accuracy_metric":
          metricsToDisplay.set("Accuracy", metrics ? metrics.accuracy : 0);
          break;
        case "f1_score_metric":
          metricsToDisplay.set("F1 Score", metrics ? metrics.f1 : 0);
          break;
        case "recall_metric":
          metricsToDisplay.set("Recall", metrics ? metrics.recall : 0);
          break;
        case "precision_metric":
          metricsToDisplay.set("Precision", metrics ? metrics.precision : 0);
          break;
      }
    }
  }

  return (
    <div className="output-box">
      <div className="output-header">
        <button
          className={`output-button ${activeTab === "metrics" ? "active" : ""}`}
          onClick={() => setActiveTab("metrics")}
        >
          Metrics
        </button>
        <button
          className={`output-button ${activeTab === "visual" ? "active" : ""}`}
          onClick={() => setActiveTab("visual")}
        >
          Visual
        </button>
        <InfoButton 
          content={
            <>
              <strong>Metrics Table</strong>
              <ul style={{ listStyleType: 'disc', marginLeft: '20px' }}>
                <li>Accuracy measures the proportion of correct predictions out of all predictions made.</li>
                <li>Precision focuses on how many of the predicted positives are actually correct.</li>
                <li>Recall measures how many of the actual positives were correctly identified.</li>
                <li>The F1 score balances precision and recall by taking their harmonic mean, making it useful when there is an uneven class distribution.</li>
              </ul>
              <br/>
              <strong>Visual</strong>
              <p>After clicking visual, you will see how many edible mushrooms you classified correctly
                 (true positives) and how many poisonous mushrooms you classified correctly (true negatives). 
                 Any red mushrooms that show up are false positives or false negatives, indicating that your 
                 model made a classification error.</p>
            </>
          }
        />
      </div>

      <div className="output-content">
        {activeTab === "metrics" ? (
          <>
            {evaluateStatus === "show" ? (
              <div className="performance-message" style={{ color: performance.color }}>
                {performance.message}
              </div>
            ) : (
              <div>{getEvaluationMessage()}</div>
            )}

            {evaluateStatus === "show" && metricsToDisplay.size > 0 ? (
              <table className="metrics-table">
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th>Value (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {[...metricsToDisplay.entries()].map(([key, value]) => (
                    <tr key={key}>
                      <td>{key}</td>
                      <td>{(value * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : evaluateStatus === "show" ? (
              <p>No metrics available.</p>
            ) : null}
          </>
        ) : (
          evaluateStatus === "show" ? (
            <div className="model-output">
            {challengeType === "mushroom-binary-classification" ? (
              <ModelOutputGrid metrics={metrics} />
            ) : challengeType === "weather-multi-classification" ? (
              <WeatherModelOutputGrid metrics={metrics} />
            ) : (
              <p>No output available for this challenge.</p>
            )}
            </div>
          ) : (
            <div>{getEvaluationMessage()}</div>
          )
        )}
      </div>
    </div>
  );
};
