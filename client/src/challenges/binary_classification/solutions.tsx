import { BlockType } from "@/types/block";

export const binary_classification_solutions = [
  {
    name: "A Perfect Model",
    overview: "This model achieves perfect accuracy by using multiple layers to learn complex patterns in mushroom features. The combination of ReLU activations and sufficient layer width allows it to capture all the necessary relationships for flawless classification.",
    diagram: {
      blocks: [
        { block_id: "linear_layer" as BlockType, order: 1, params: { out_features: 64 } },
        { block_id: "relu_activation" as BlockType, order: 2, params: {} },
        { block_id: "linear_layer" as BlockType, order: 3, params: { out_features: 64 } },
        { block_id: "relu_activation" as BlockType, order: 4, params: {} },
        { block_id: "linear_layer" as BlockType, order: 5, params: { out_features: 64 } },
        { block_id: "relu_activation" as BlockType, order: 6, params: {} },
        { block_id: "linear_layer" as BlockType, order: 7, params: { out_features: 1 } },
        { block_id: "sigmoid_activation" as BlockType, order: 8, params: {} },
      ],
      execution: "train",
      dataset: "mushrooms",
      optimizer: "sgd_algorithm" as BlockType,
      loss_fn: "cross_entropy_loss" as BlockType,
      evalFns: ["accuracy_metric", "precision_metric", "recall_metric", "f1_score_metric"],
      lr: 0.001,
      epochs: 20,
    },
    explanations: {
      model: "This model has 3 sets of processing units (linear layers) paired with ReLU functions. Linear layers learn relationships in the data, while ReLU functions help focus on important features by keeping positive values and removing negative ones. The final layer (size 1) with sigmoid converts everything into a probability between 0 and 1 for the final yes/no decision.",
      loss: "Cross entropy loss is designed for yes/no decisions - it compares the model's confidence (probability) with the true answer. When the model is very confident and right, the loss is low; when it's confident and wrong, the loss is high.",
      optimizer: "SGD (Stochastic Gradient Descent) updates the model's internal numbers based on the loss. It looks at small batches of mushrooms, sees how wrong the predictions are, and tweaks the model's parameters to do better next time."
    },
    result: {
      f1_score_metric: 1.0,
      precision_metric: 1.0,
      recall_metric: 1.0,
      accuracy_metric: 1.0,
      false_positive_metric: 0.0,
    },
  },
  {
    name: "The Best One-Layer Model",
    overview: "Despite its simplicity, this model performs exceptionally well with 99% accuracy by using a tanh activation that creates clear decision boundaries between edible and poisonous mushrooms.",
    diagram: {
      blocks: [
        { block_id: "linear_layer" as BlockType, order: 1, params: { out_features: 1 } },
        { block_id: "tanh_activation" as BlockType, order: 2, params: {} },
      ],
      execution: "train",
      dataset: "mushrooms",
      optimizer: "sgd_algorithm" as BlockType,
      loss_fn: "hinge_loss" as BlockType,
      evalFns: ["accuracy_metric", "precision_metric", "recall_metric", "f1_score_metric"],
      lr: 0.001,
      epochs: 20,
    },
    explanations: {
      model: "This model has just one linear layer that processes mushroom features, followed by a tanh function. The linear layer finds important relationships in the data, while tanh squishes values between -1 and 1, helping make clear yes/no decisions.",
      loss: "Hinge loss creates a safety zone around the decision boundary. It wants predictions to be not just correct, but confidently correct - pushing the model to make clear distinctions between edible and poisonous mushrooms.",
      optimizer: "SGD (Stochastic Gradient Descent) works by taking small steps to improve the model. With just one layer to adjust, it can efficiently find the right balance of weights to separate edible from poisonous mushrooms."
    },
    result: {
      f1_score_metric: 0.99,
      precision_metric: 1.0,
      recall_metric: 0.98,
      accuracy_metric: 0.99,
      false_positive_metric: 0.0,
    },
  },
  {
    name: "A Decent Model",
    overview: "This model achieves good but not perfect accuracy (90.7%) as its sigmoid activations, while making smooth decisions, can sometimes be too gradual for sharp classification boundaries.",
    diagram: {
      blocks: [
        { block_id: "linear_layer" as BlockType, order: 1, params: { out_features: 64 } },
        { block_id: "sigmoid_activation" as BlockType, order: 2, params: {} },
        { block_id: "linear_layer" as BlockType, order: 3, params: { out_features: 64 } },
        { block_id: "sigmoid_activation" as BlockType, order: 4, params: {} },
        { block_id: "linear_layer" as BlockType, order: 5, params: { out_features: 1 } },
        { block_id: "sigmoid_activation" as BlockType, order: 6, params: {} },
      ],
      execution: "train",
      dataset: "mushrooms",
      optimizer: "sgd_algorithm" as BlockType,
      loss_fn: "cross_entropy_loss" as BlockType,
      evalFns: ["accuracy_metric", "precision_metric", "recall_metric", "f1_score_metric"],
      lr: 0.001,
      epochs: 20,
    },
    explanations: {
      model: "This model uses three linear layers (first two size 64, last size 1) with sigmoid functions between them. Each sigmoid squishes values between 0 and 1, making the transitions between layers smooth. The multiple layers allow the model to learn increasingly refined patterns.",
      loss: "Cross entropy loss works well with sigmoid outputs because both deal with probabilities between 0 and 1. It helps the model learn by comparing its probability predictions with the true yes/no answers.",
      optimizer: "SGD (Stochastic Gradient Descent) adjusts each layer's parameters to minimize mistakes. It needs to carefully balance changes across all three layers, making sure improvements in one layer don't disrupt the others."
    },
    result: {
      f1_score_metric: 0.896,
      precision_metric: 0.967,
      recall_metric: 0.835,
      accuracy_metric: 0.907,
      false_positive_metric: 0.0,
    },
  },
  {
    name: "An Okay Model",
    overview: "With only 74.6% accuracy, this simple model struggles to capture the complexity of mushroom classification, showing that some problems require more sophisticated architectures.",
    diagram: {
      blocks: [
        { block_id: "linear_layer" as BlockType, order: 1, params: { out_features: 1 } },
        { block_id: "softmax_activation" as BlockType, order: 2, params: {} },
      ],
      execution: "train",
      dataset: "mushrooms",
      optimizer: "sgd_algorithm" as BlockType,
      loss_fn: "hinge_loss" as BlockType,
      evalFns: ["accuracy_metric", "precision_metric", "recall_metric", "f1_score_metric"],
      lr: 0.001,
      epochs: 20,
    },
    explanations: {
      model: "This simple model has one linear layer followed by a softmax function. The linear layer learns a single set of weights for each mushroom feature, and softmax converts these into probabilities that add up to 1, giving the likelihood of edible vs. poisonous.",
      loss: "Hinge loss treats the decision like a dividing line - it wants mushrooms to fall clearly on either the edible or poisonous side, with no middle ground. This helps make more decisive predictions.",
      optimizer: "SGD (Stochastic Gradient Descent) fine-tunes the weights in the single linear layer. It adjusts how much importance to give each mushroom feature to make the best possible prediction with this simple structure."
    },
    result: {
      f1_score_metric: 0.741,
      precision_metric: 0.727,
      recall_metric: 0.756,
      accuracy_metric: 0.746,
      false_positive_metric: 0.0,
    },
  },
];
