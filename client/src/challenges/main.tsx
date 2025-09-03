import { BlockType } from "@/types/block";
import { binary_classification_solutions } from "./binary_classification/solutions";

export type ChallengeName = "mushroom-binary-classification";

interface SolutionBlock {
  block_id: BlockType;
  order: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: Record<string, any>;
}

interface SolutionInterface {
  name: string;
  overview: string;
  diagram: {
    blocks: SolutionBlock[];
    execution: string;
    dataset: string;
    optimizer: BlockType;
    loss_fn: BlockType;
    evalFns: string[];
    lr: number;
    epochs: number;
  };
  explanations: {
    model: string;
    loss: string;
    optimizer: string;
  };
  result: {
    f1_score_metric: number;
    precision_metric: number;
    recall_metric: number;
    accuracy_metric: number;
    false_positive_metric: number;
  };
}

export interface ChallengeInfo {
  title: string;
  description: string;
  difficulty: "beginner" | "intermeidate" | "advanced";
  tags: string[];
  slug: string;
  estimatedTime: number; // in minutes
  solutions: SolutionInterface[];
}

export const ChallengeInfo: Record<string, ChallengeInfo> = {
  "mushroom-binary-classification": {
    title: "Mushroom Binary Classification",
    description: "Build an AI model to classify mushrooms as edible or poisonous.",
    difficulty: "beginner",
    tags: ["classification", "binary"],
    slug: "mushroom-binary-classification",
    estimatedTime: 15,
    solutions: binary_classification_solutions,
  },
};
