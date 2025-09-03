import { UniqueIdentifier } from "@dnd-kit/core";
import { Coordinates } from "@dnd-kit/core/dist/types";
import { BlockCategory } from "./blockCategory";

export type BlockStatus = "available" | "dropped";
export type BlockLayout = "standard" | "cBlock" | "startBlock";

// DEFINING BLOCK TYPE
export type BlockType =
  | "when_train_start"
  | "when_eval_start"
  | "load_data"
  | "choose_dataset"
  | "feature_extraction"
  | "define_labels"
  | "train_test_split"
  | "define_model"
  | "linear_layer"
  | "dropout_layer"
  | "sigmoid_activation"
  | "relu_activation"
  | "tanh_activation"
  | "softmax_activation"
  | "define_loss_function"
  | "hinge_loss"
  | "bce"
  | "cross_entropy_loss"
  | "define_optimizer"
  | "sgd_algorithm"
  | "momentum_algorithm"
  | "load_metrics"
  | "accuracy_metric"
  | "precision_metric"
  | "recall_metric"
  | "f1_score_metric";
// | "confusion_matrix_metric"
// | "loss_curve"
// | "accuracy_curve";

export interface Block {
  id: number;
  type: BlockType;
  status: BlockStatus;
  position?: Coordinates;
  parentId?: UniqueIdentifier;
  externalId?: UniqueIdentifier;
  internalIds?: UniqueIdentifier[]; // in a cBlock, this is a list of the internal blocks in order
  childId?: UniqueIdentifier;
}

interface typeInformation {
  label: string;
  category: BlockCategory;
  layout: BlockLayout;
  description?: string;
  pytorchName?: string;
  scikitName?: string;
}

export const blockTypeInformation: Record<BlockType, typeInformation> = {
  when_train_start: {
    label: `When "train" clicked`,
    category: "general",
    layout: "startBlock",
    description:
      "This is your starting block - it tells your model when and how to begin learning from the data.",
  },
  when_eval_start: {
    label: `When "evaluate" clicked`,
    category: "general",
    layout: "startBlock",
    description: "This block starts testing how well your trained model performs on new examples.",
  },
  load_data: {
    label: "Load Data",
    category: "data",
    layout: "cBlock",
    description:
      "Think of this as opening a book - it loads all the examples your model will learn from.",
  },
  choose_dataset: {
    label: "Choose Dataset",
    category: "data",
    layout: "standard",
    description: "Picks which collection of examples to use for teaching your model.",
  },
  feature_extraction: {
    label: "Feature Extraction",
    category: "data",
    layout: "standard",
    description: "Helps your model focus on the important characteristics of each example.",
  },
  define_labels: {
    label: "Define Labels",
    category: "data",
    layout: "standard",
    description: "Tells your model what category each example belongs to in the training data.",
  },
  train_test_split: {
    label: "Train Test Split",
    category: "data",
    layout: "standard",
    description: "Divides your examples into two groups: one for learning and one for testing.",
  },
  define_model: {
    label: "Define Model",
    category: "layer",
    layout: "cBlock",
    description:
      "This is where you build your model's brain (neural network) by connecting different learning layers together.",
  },
  linear_layer: {
    label: "Linear Layer",
    category: "layer",
    layout: "standard",
    description: "A basic building block that helps your model learn patterns in the data.",
  },
  dropout_layer: {
    label: "Dropout Layer",
    category: "layer",
    layout: "standard",
    description:
      "Helps your model learn more reliably by randomly ignoring some information during training.",
  },
  sigmoid_activation: {
    label: "Sigmoid Activation",
    category: "layer",
    layout: "standard",
    description: "Helps your model make yes/no decisions between two categories.",
  },
  relu_activation: {
    label: "ReLU Activation",
    category: "layer",
    layout: "standard",
    description:
      "Helps your model learn complex patterns by focusing on the most important information.",
  },
  tanh_activation: {
    label: "Tanh Activation",
    category: "layer",
    layout: "standard",
    description:
      "Another way to help your model learn patterns, similar to sigmoid but in a different range.",
  },
  softmax_activation: {
    label: "Softmax Activation",
    category: "layer",
    layout: "standard",
    description:
      "Helps your model make decisions when there are multiple categories to choose from.",
  },
  define_loss_function: {
    label: "Define Loss Function",
    category: "loss",
    layout: "cBlock",
    description: "This tells your model how to measure its mistakes so it can learn from them.",
  },
  hinge_loss: {
    label: "Hinge Loss",
    category: "loss",
    layout: "standard",
    description:
      "A way for your model to measure its mistakes when classifying between categories.",
  },
  bce: {
    label: "Binary Cross Entropy Loss",
    category: "loss",
    layout: "standard",
    description: "For binary tasks only: the most common way for your model to measure its mistakes in yes/no decisions.",
  },
  cross_entropy_loss: {
    label: "Cross Entropy Loss",
    category: "loss",
    layout: "standard",
    description: "The most common way for your model to measure its mistakes in multi-class decisions.",
  },
  define_optimizer: {
    label: "Define Optimizer",
    category: "algorithm",
    layout: "cBlock",
    description:
      "This is like a teacher that helps your model learn from its mistakes and improve.",
  },
  sgd_algorithm: {
    label: "SGD Algorithm",
    category: "algorithm",
    layout: "standard",
    description: "A simple way for your model to learn gradually from each example.",
  },
  momentum_algorithm: {
    label: "Momentum Algorithm",
    category: "algorithm",
    layout: "standard",
    description:
      "Helps your model learn faster by remembering which direction was helpful in previous steps.",
  },
  load_metrics: {
    label: "Load Metrics",
    category: "evaluation",
    layout: "cBlock",
    description:
      "This section lets you measure how well your model is performing its task. Connect this to the purple 'Evaluation' block to test your model.",
  },
  accuracy_metric: {
    label: "Accuracy Metric",
    category: "evaluation",
    layout: "standard",
    description: "Shows what percentage of examples your model correctly identified.",
  },
  precision_metric: {
    label: "Precision Metric",
    category: "evaluation",
    layout: "standard",
    description: "Shows how often your model is right when it predicts a specific category.",
  },
  recall_metric: {
    label: "Recall Metric",
    category: "evaluation",
    layout: "standard",
    description: "Shows how many examples of a specific category your model found correctly.",
  },
  f1_score_metric: {
    label: "F1 Score Metric",
    category: "evaluation",
    layout: "standard",
    description: "Combines precision and recall into one score to show overall performance.",
  },
  // confusion_matrix_metric: {
  //   label: "Confusion Matrix",
  //   category: "evaluation",
  //   layout: "standard",
  //   description: "Shows a detailed breakdown of your model's correct and incorrect predictions.",
  // },
  // loss_curve: {
  //   label: "Loss Curve",
  //   category: "evaluation",
  //   layout: "standard",
  //   description: "Shows how your model's mistakes change over time as it learns.",
  // },
  // accuracy_curve: {
  //   label: "Accuracy Curve",
  //   category: "evaluation",
  //   layout: "standard",
  //   description: "Shows how your model's accuracy improves over time as it learns.",
  // },
};

export type MovingStack = Record<UniqueIdentifier, Coordinates>;
export type Blocks = Record<UniqueIdentifier, Block>;
