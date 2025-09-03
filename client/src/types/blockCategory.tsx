// DEFINING CATEGORIES OF BLOCKS
export type BlockCategory = "general" | "data" | "layer" | "loss" | "algorithm" | "evaluation";
export const BlockCategories: BlockCategory[] = [
  "general",
  "data",
  "layer",
  "loss",
  "algorithm",
  "evaluation",
];

interface categoryToColor {
  background: string;
  border: string;
}
export const blockCategoryToColor: Record<BlockCategory, categoryToColor> = {
  general: {
    background: "var(--light-purple)",
    border: "var(--dark-purple)",
  },
  data: {
    background: "var(--light-green)",
    border: "var(--dark-green)",
  },
  layer: {
    background: "var(--light-blue)",
    border: "var(--dark-blue)",
  },
  loss: {
    background: "var(--light-orange)",
    border: "var(--dark-orange)",
  },
  algorithm: {
    background: "var(--light-yellow)",
    border: "var(--dark-yellow)",
  },
  evaluation: {
    background: "var(--light-red)",
    border: "var(--dark-red)",
  },
};
