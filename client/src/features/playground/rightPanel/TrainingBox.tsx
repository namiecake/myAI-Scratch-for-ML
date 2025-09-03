import { DisplayedMetrics } from "@/types/diagram";
import { TrainingStatus } from "@/types/training";
import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import ProgressBar from "@/components/progressBar";

// Register necessary Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const TrainingBox: React.FC<{
  trainingStatus: TrainingStatus;
  metrics: DisplayedMetrics;
}> = ({ trainingStatus, metrics }) => {
  
  // Prepare data for the loss curve chart
  const lossData = {
    labels:
      metrics && metrics.lossCurve
        ? // Map over the loss curve data to label each epoch
          metrics.lossCurve.map((_, index: number) => `Epoch ${index + 1}`)
        : [],
    datasets: [
      {
        label: "Loss Curve",
        data: (metrics && metrics.lossCurve) || [],
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
      },
    ],
  };

  // Timer progress state for the loading phase
  const [currentTimerProgress, setCurrentTimerProgress] = useState<number>(0);

  useEffect(() => {
    // Reset timer progress when loading starts
    setCurrentTimerProgress(0);

    if (trainingStatus !== "loading") return;

    // Increment timer progress every second
    const interval = setInterval(() => {
      setCurrentTimerProgress((prev) => Math.min(96, prev + 2));
    }, 1000);

    return () => clearInterval(interval);
  }, [trainingStatus]);

  // Renders different UI based on the training status
  const loadBoxContents = () => {
    switch (trainingStatus) {
      
      case "empty":
        return (
          <div className="loading-box">
            <p>Click the Train button to start training</p>
          </div>
        );
      
      case "loading":
        return (
          <div className="loading-box">
            
            <p>Preparing to train your model...</p>
            <ProgressBar progress={currentTimerProgress} />
          </div>
        );
      
      case "error":
        return (
          <div className="loading-box">
            <p className="error-message">
              An error occurred during training. Please try again.
            </p>
          </div>
        );

      default:
        return (
          // Display the loss curve chart once training has data
          <div
            style={{
              marginBottom: "20px",
              height: "300px",
            }}
          >
            <h4
              style={{
                textAlign: "center",
              }}
            >
              Model Loss Progress ({metrics.lossCurve.length}/20 epochs)
            </h4>
            <Line
              data={lossData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false, 
                  },
                },
                scales: {
                  x: {
                    grid: {
                      display: false, 
                    },
                  },
                },
              }}
              style={{
                maxHeight: "100%",
              }}
            />
          </div>
        );
    }
  };

  return (
    <div className="training-box">
      {/* Load dynamic content based on the training state */}
      {loadBoxContents()}
    </div>
  );
};
