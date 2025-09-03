import React, { useEffect, useState } from "react";
import { Blocks } from "@/types/block";
import { Controls } from "./controls";
import { useWebSocketContext } from "@/contexts/WebSocketContext";
import { DisplayedMetrics } from "@/types/diagram";
import { TrainingBox } from "./TrainingBox";
import { OutputBox } from "./OutputBox";
import { EvaluateStatus, TrainingStatus } from "@/types/training";
import { ChallengeType } from "@/challenges/challenge";
import "./RightPanel.css";

export const RightPanel: React.FC<{
  droppedBlocks: Blocks;
  challengeId: string;
}> = ({ droppedBlocks, challengeId }) => {
  const challengeType = challengeId as ChallengeType || "";

  const { messages } = useWebSocketContext();
  const [metrics, setMetrics] = useState<DisplayedMetrics>({
    accuracy: 0,
    precision: 0,
    recall: 0,
    f1: 0,
    false_positive: 0,
    lossCurve: [],
    accuracyCurve: [],
    fog_accuracy: 0,
    rain_accuracy: 0,
    snow_accuracy: 0,
    sun_accuracy: 0,
    drizzle_accuracy: 0,
  });
  const [trainingStatus, setTrainingStatus] = useState<TrainingStatus>("empty");
  const [showEvaluationResults, setShowEvaluationResults] = useState<EvaluateStatus>("empty");

  useEffect(() => {
    if (messages.length === 0) return;

    const latestMessage = messages[messages.length - 1];
    let parsedData;
    try {
      parsedData = typeof latestMessage === "string" ? JSON.parse(latestMessage) : latestMessage;
    } catch (error) {
      console.error("Error parsing websocket message:", error);
      parsedData = {};
    }

    const new_metrics = { ...metrics };
    if (parsedData.update_type == "progress") {
      new_metrics.lossCurve = [...new_metrics.lossCurve, parsedData.metrics.loss];
      if (trainingStatus !== "training") {
        setTrainingStatus("training");
      }
    } else if (parsedData.update_type == "result") {
      setTrainingStatus("result");
      new_metrics.accuracy = parsedData.metrics.accuracy_metric ?? 0;
      new_metrics.precision = parsedData.metrics.precision_metric ?? 0;
      new_metrics.recall = parsedData.metrics.recall_metric ?? 0;
      new_metrics.f1 = parsedData.metrics.f1_score_metric ?? 0;
      new_metrics.fog_accuracy = parsedData.metrics.fog_accuracy ?? 0;
      new_metrics.rain_accuracy = parsedData.metrics.rain_accuracy ?? 0;
      new_metrics.snow_accuracy = parsedData.metrics.snow_accuracy ?? 0;
      new_metrics.sun_accuracy = parsedData.metrics.sun_accuracy ?? 0;
      new_metrics.drizzle_accuracy = parsedData.metrics.drizzle_accuracy ?? 0;
    } else if (parsedData.update_type == "error") {
      setTrainingStatus("error");
    }
    setMetrics(new_metrics);
  }, [messages]);

  const updateTrainingStatus = (newStatus: TrainingStatus) => {
    setTrainingStatus(newStatus);
    // Reset metrics when training starts again
    if (newStatus == "loading") {
      setMetrics({
        accuracy: 0,
        precision: 0,
        recall: 0,
        f1: 0,
        false_positive: 0,
        lossCurve: [],
        accuracyCurve: [],
        fog_accuracy: 0,
        rain_accuracy: 0,
        snow_accuracy: 0,
        sun_accuracy: 0,
        drizzle_accuracy: 0,
      });
    }
  };

  const updateEvaluateStatus = (newStatus: EvaluateStatus) => {
    setShowEvaluationResults(newStatus);
  };

  return (
    <div className="right-panel">
      <div className="tab-container">
        <Controls
          droppedBlocks={droppedBlocks}
          updateTrainingStatus={updateTrainingStatus}
          trainingStatus={trainingStatus}
          updateEvaluateStatus={updateEvaluateStatus}
          challengeId={challengeId}
        />
      </div>
      <div className="right-panel-boxes">
        <TrainingBox metrics={metrics} trainingStatus={trainingStatus} />
        <OutputBox
          metrics={metrics}
          trainingStatus={trainingStatus}
          evaluateStatus={showEvaluationResults}
          blocks={droppedBlocks}
          challengeType={challengeType}
        />
      </div>
    </div>
  );
};
