import { BlockType } from "@/types/block";

export const binary_classification_solutions = [
  {
    name: "",
    overview: "",
    diagram: {
      blocks: [
        { block_id: "linear_layer", order: 1, params: { out_features: 64 } },
        { block_id: "tanh_activation", order: 2, params: {} },
        { block_id: "linear_layer", order: 3, params: { out_features: 64 } },
        { block_id: "tanh_activation", order: 4, params: {} },
        { block_id: "linear_layer", order: 5, params: { out_features: 1 } },
      ],
      execution: "train",
      dataset: "weather",
      optimizer: "momentum_algorithm" as BlockType,
      loss_fn: "cross_entropy_loss" as BlockType,
      evalFns: ["accuracy_metric", "precision_metric", "recall_metric", "f1_score_metric"],
      lr: 0.001,
      epochs: 20,
    },
    explanations: {
      model: "",
      optimizer: "",
    },
    result: {
      accuracy_metric: 75.768,
      f1_score_metric: 0.323,
      precision_metric: 0.306,
      recall_metric: 0.346,
    },
  },
  {
    name: "",
    overview: "",
    explanations: {
      model: "",
      optimizer: "",
    },
    diagram: {
      blocks: [
        { block_id: "linear_layer", order: 1, params: { out_features: 64 } },
        { block_id: "relu_activation", order: 2, params: {} },
        { block_id: "linear_layer", order: 3, params: { out_features: 1 } },
      ],
      execution: "train",
      dataset: "weather",
      optimizer: "sgd_algorithm",
      loss_fn: "cross_entropy_loss",
      evalFns: ["accuracy_metric", "precision_metric", "recall_metric", "f1_score_metric"],
      lr: 0.001,
      epochs: 20,
    },
    result: {
      accuracy_metric: 74.744,
      f1_score_metric: 0.32,
      precision_metric: 0.305,
      recall_metric: 0.341,
    },
  },
  {
    name: "",
    overview: "",
    explanations: {
      model: "",
      optimizer: "",
    },
    diagram: {
      blocks: [
        { block_id: "linear_layer", order: 1, params: { out_features: 64 } },
        { block_id: "softmax_activation", order: 2, params: {} },
        { block_id: "linear_layer", order: 3, params: { out_features: 1 } },
      ],
      execution: "train",
      dataset: "weather",
      optimizer: "sgd_algorithm",
      loss_fn: "cross_entropy_loss",
      evalFns: ["accuracy_metric", "precision_metric", "recall_metric", "f1_score_metric"],
      lr: 0.001,
      epochs: 20,
    },
    result: {
      accuracy_metric: 63.481,
      f1_score_metric: 0.269,
      precision_metric: 0.254,
      recall_metric: 0.289,
    },
  },
  {
    name: "",
    overview: "",
    explanations: {
      model: "",
      optimizer: "",
    },
    diagram: {
      blocks: [
        { block_id: "linear_layer", order: 1, params: { out_features: 64 } },
        { block_id: "softmax_activation", order: 2, params: {} },
        { block_id: "linear_layer", order: 3, params: { out_features: 64 } },
        { block_id: "softmax_activation", order: 4, params: {} },
        { block_id: "linear_layer", order: 5, params: { out_features: 64 } },
        { block_id: "softmax_activation", order: 6, params: {} },
        { block_id: "linear_layer", order: 7, params: { out_features: 1 } },
      ],
      execution: "train",
      dataset: "weather",
      optimizer: "sgd_algorithm",
      loss_fn: "cross_entropy_loss",
      evalFns: ["accuracy_metric", "precision_metric", "recall_metric", "f1_score_metric"],
      lr: 0.001,
      epochs: 20,
    },
    result: {
      accuracy_metric: 43.686,
      f1_score_metric: 0.122,
      precision_metric: 0.087,
      recall_metric: 0.2,
    },
  },
];
