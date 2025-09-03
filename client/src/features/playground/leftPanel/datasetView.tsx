import React from "react";
import "../playground.css";
import { BinaryClassificationDataset } from "@/challenges/binary_classification/datasetContent";
import { InfoButton } from '@/components/InfoButton';
import { WeatherDataset } from "@/challenges/weather_classification/weatherDatasetContent";

export const DatasetView: React.FC<{
  challengeId: string;
}> = ({ challengeId }) => {

  const style: React.CSSProperties = {
    height: "100%",
    width: "100%",
    borderRadius: "10px",
    padding: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    overflow: "auto",
  };
  const headerStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: "gray",
  };

  let description = "";

  const getDatasetComponent = (): [React.FC, string] => {
    switch (challengeId) {
      case "weather-multi-classification":
        description = "This dataset contains daily weather data from Seattle over the past 4 years with their features and corresponding weather classifications. The preview shows 3 samples from this dataset. Each row represents a single day's weather, and each column represents a different characteristic or feature of that sample. Go to the challenge page to learn more about the dataset and the code tab to start building your model."
        return [WeatherDataset, description];
      case "mushroom-binary-classification":
        description = "This dataset shows examples of different mushrooms with their features and classifications (whether they are poisonous or not). Each row represents one example, and each column represents a different characteristic or feature of that example. Go to the challenge page to learn more about the dataset and the code tab to start building your model."
        return [BinaryClassificationDataset, description];
      default:
        return [BinaryClassificationDataset, description];
    }
  };

  const [DatasetComponent, data_description] = getDatasetComponent();

  return (
    <div style={style}>
      <div style={headerStyle}>
        <p style={{ textAlign: "center", flex: 1 }}>Dataset Preview</p>
        <InfoButton 
          content={data_description}
        />
      </div>
      <DatasetComponent />
    </div>
  );
};
