// NOTE: has super hardcoded/placeholder values for demo purposes
import React from "react";
import { 
  BsCloudSnow,
  BsCloudRain,
  BsCloudLightningRain,
  BsClouds,
  BsSun,
 } from "react-icons/bs";
import { DisplayedMetrics } from "@/types/diagram";

export const WeatherModelOutputGrid: React.FC<{metrics: DisplayedMetrics | null}> = (
  {metrics}
) => {
  console.log("weather metrics: ", metrics);
  const weatherClasses = [
    { label: "Sunny", icon: BsSun, color: "#f39c12" }, // yellow
    { label: "Stormy", icon: BsCloudLightningRain, color: "#9b59b6" }, // purple
    { label: "Cloudy", icon: BsClouds, color: "#95a5a6" }, // gray
    { label: "Rainy", icon: BsCloudRain, color: "#43aaf0" }, // light blue
    { label: "Snowy", icon: BsCloudSnow, color: "#2d75a6" }, // dark blue
  ];

  const gridStyle = {
    color: "#495057",
    height: "100%",
    display: "flex",
    flexDirection: "column" as const,
    gap: "3%",
  };

  const sectionStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(8, 1fr)",
    gridTemplateRows: "repeat(5, 1fr)",
    columnGap: "1px",
    rowGap: "1%",
    placeItems: "center",
    padding: "3%",
  };

  const labelStyle = {
    color: "#495057",
    fontSize: "0.9em",
    fontWeight: "bold",
    marginLeft: "1%",
  };

  const getClassAccuracies = () => {
    if (!metrics) return weatherClasses.map(() => 0); // Default: 0% accuracy for all classes

    const accuracyKeys = ["sun_accuracy", "rain_accuracy", "fog_accuracy", "drizzle_accuracy", "snow_accuracy"] as const;

    return weatherClasses.map((_, index) => {
      const key = accuracyKeys[index]; 
      const accuracy = metrics[key as keyof DisplayedMetrics]; // might be number | number[]

      return Array.isArray(accuracy) ? accuracy[0] : (accuracy as number) ?? 0; // ensure it's always a number
    });
  };

  const getMisclassificationCounts = () => {
    const totalSamplesPerClass = 40; // each class has 40 samples
    const classAccuracies = getClassAccuracies();
  
    return classAccuracies.map((accuracy) => {
      const correct = Math.floor(accuracy * totalSamplesPerClass);
      return totalSamplesPerClass - correct; // Misclassified samples per class
    });
  };

  const misclassifications = getMisclassificationCounts();

  return (
    <div style={gridStyle}>
      {weatherClasses.map((weather, index) => (
        <div key={weather.label}>
          <span style={labelStyle}>
            {weather.label}{" "}
            ({metrics ? `${((40 - misclassifications[index])/40.0) * 100}% classified correctly` : "waiting for model..."})
          </span>
          <div
            style={sectionStyle}
          >
            {Array(40)
              .fill(null)
              .map((_, i) => {
                const Icon = weather.icon;
                const color = metrics
                  ? i < 40 - misclassifications[index]
                    ? weather.color // correct classification
                    : "#dc3545" // misclassified (Red)
                  : "#6c757d"; // default (gray)
                return (
                  <div key={`${weather.label}-${i}`}>
                    <Icon size={25} color={color} />
                  </div>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
};