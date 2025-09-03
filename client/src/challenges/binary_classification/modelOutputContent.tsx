import React, { useState} from "react";
import {
  GiMushroomGills,
  GiMushroom,
  GiSpottedMushroom,
  GiSuperMushroom,
  GiGrassMushroom,
} from "react-icons/gi";
import { TbMushroom } from "react-icons/tb";
import { DisplayedMetrics } from "@/types/diagram";

export const ModelOutputGrid: React.FC<{metrics: DisplayedMetrics | null}> = (
  {metrics}
) => {
  const edibleIcons = [GiMushroomGills, TbMushroom, GiGrassMushroom];
  const poisonousIcons = [GiSpottedMushroom, GiSuperMushroom, GiMushroom];

  const [edibleIconTypes] = useState(() =>
    Array(100)
      .fill(null)
      .map((_, index) => edibleIcons[index % edibleIcons.length])
  );
  const [poisonousIconTypes] = useState(() =>
    Array(100)
      .fill(null)
      .map((_, index) => poisonousIcons[index % poisonousIcons.length])
  );

  const gridStyle = {
    color: "#495057",
    height: "100%",
    display: "flex",
    flexDirection: "column" as const,
    gap: "3%",
  };

  const sectionStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(10, 1fr)",
    gridTemplateRows: "repeat(10, 1fr)",
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

  const dividerStyle = {
    width: "100%",
    height: "1px",
    backgroundColor: "#dee2e6",
    margin: "2% 0",
  };

  // const accuracyStyle = {
  //   textAlign: "center" as const,
  //   color: "#495057",
  //   fontSize: "0.9em",
  //   marginTop: "2%",
  // };

  const getMisclassificationCounts = () => {
    if (!metrics) {
      return { edibleMisclassified: 0, poisonousMisclassified: 0 };
    }
    // False Negatives 
    const edibleMisclassified = metrics.recall > 0 ? Math.ceil((1 - metrics.recall) * 100) : 0;
    // False Positives
    const poisonousMisclassified = metrics.recall > 0 ? Math.floor(metrics.false_positive * 100) : 0;
    return { edibleMisclassified, poisonousMisclassified };
  };

  const { edibleMisclassified, poisonousMisclassified } = getMisclassificationCounts();

  return (
    <div style={gridStyle}>
      <span style={labelStyle}>
        Edible{" "}
        (
          {metrics?.recall && metrics.recall > 0
            ? `${100 - edibleMisclassified}/100 classified`
            : "waiting for model..."}
        )
      </span>
      <div style={sectionStyle}>
        {edibleIconTypes.map((Icon, index) => {
          const color =
            metrics?.recall && metrics.recall > 0
              ? index < 100 - edibleMisclassified
                ? "#28a745"
                : "#dc3545"
              : "#6c757d";
          return (
            <div key={`edible-${index}`}>
              <Icon size={25} color={color} />
            </div>
          );
        })}
      </div>
  
      <div style={dividerStyle} />
  
      <span style={labelStyle}>
        Poisonous{" "}
        (
          {metrics?.recall && metrics.recall > 0
            ? `${100 - poisonousMisclassified}/100 classified`
            : "waiting for model..."}
        )
      </span>
      <div style={sectionStyle}>
        {poisonousIconTypes.map((Icon, index) => {
          const color =
            metrics?.recall && metrics.recall > 0
              ? index < 100 - poisonousMisclassified
                ? "#28a745"
                : "#dc3545"
              : "#6c757d";
          return (
            <div key={`poisonous-${index}`}>
              <Icon size={25} color={color} />
            </div>
          );
        })}
      </div>
    </div>
  );
  
};
