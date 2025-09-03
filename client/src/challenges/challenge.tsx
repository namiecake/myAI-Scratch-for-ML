export type ChallengeType = "mushroom-binary-classification" | "weather-multi-classification";

export interface ChallengeInfo {
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  tags: string[];
  slug: string;
  estimatedTime: number; // in minutes
}

// maps challenge name to challengeInfo
export const ChallengeInfo: Record<string, ChallengeInfo> = {
  mushroom_binary_classification: {
    title: "Mushroom Binary Classification",
    description: "Build an AI model to classify mushrooms as edible or poisonous.",
    difficulty: "beginner",
    tags: ["classification", "binary"],
    slug: "mushroom-binary-classification",
    estimatedTime: 15,
  },
  weather_multi_classification: {
    title: "Weather Forecast",
    description: "Build an AI model to predict the weather based on historical data!",
    difficulty: "intermediate",
    tags: ["classification", "multiclass"],
    slug: "weather-multi-classification",
    estimatedTime: 20,
  },
};
