type ExecutionType = "train" | "test" | "predict";
export type DatasetType = "emails" | "mushrooms" | "audio" | "text" | "weather";

export interface DiagramType {
  blocks: {
    block_id: string;
    order: number; // tells backend which index the layer is at
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    params?: Record<string, any>; // params for pytorch
  }[];
  execution: ExecutionType;
  dataset: DatasetType;
  optimizer: string;
  loss_fn: string;
  evalFns: string[];
  lr: number;
  epochs: number;
}

export interface DiagramReturnType {
  message: string;
  update_type: string;
  data: DiagramType;
}

export interface WebSocketMessage {
  message: string;
  update_type: "result" | "progress";
  metrics: Record<string, number>;
}

export interface DisplayedMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  false_positive: number;
  lossCurve: number[];
  accuracyCurve: number[];
  fog_accuracy: number,
  rain_accuracy: number,
  snow_accuracy: number,
  sun_accuracy: number,
  drizzle_accuracy: number,
}

export interface Warnings {
  type: "error" | "warning";
  message: string;
  layer: number;
}
