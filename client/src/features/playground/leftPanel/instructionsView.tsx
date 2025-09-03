import React from "react";
import "../playground.css";
import {
  instructionsContent as mushroomInstructions,
  InstructionsContent as MushroomInstructions,
} from "@/challenges/binary_classification/instructionsContent";
import {
  instructionsContent as weatherInstructions,
  InstructionsContent as WeatherInstructions,
} from "@/challenges/weather_classification/weatherInstructionsContent";

export const InstructionsView: React.FC<{
  challengeId: string;
}> = ({ challengeId }) => {

  const getInstructionsContent = () => {
    switch (challengeId) {
      case "weather-multi-classification":
        return {
          styles: weatherInstructions.styles,
          Content: WeatherInstructions,
        };
      case "mushroom-binary-classification":
      default:
        return {
          styles: mushroomInstructions.styles,
          Content: MushroomInstructions,
        };
    }
  };

  const { styles, Content } = getInstructionsContent();

  return (
    <div style={styles.container}>
      <p style={{ textAlign: "center", color: "gray" }}>Challenge Instructions</p>
      <Content />
    </div>
  );
};

