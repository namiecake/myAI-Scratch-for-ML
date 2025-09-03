import { Blocks} from "@/types/block";

export const checkForEvalErrors = (
  droppedBlocks: Blocks
): {
  errorMessage?: string;
  error: boolean;
} => {
  // Check 1: Ensure 'When Evaluate Clicked' block exists
  const evaluateBlock = Object.values(droppedBlocks).find( (block) => block.type === "when_eval_start");
  if (!evaluateBlock) {
    return {
      errorMessage: "No 'When Evaluate Clicked' block has been added to the sandbox",
      error: true,
    };
  }

  // Check 2: Ensure 'Load Metrics' block exists
  const metricsBlockAttached = evaluateBlock.childId;
  const metricsBlock = Object.values(droppedBlocks).find(
    (block) => block.type === "load_metrics"
  );
  if (metricsBlock && !metricsBlockAttached) {
    return {
      errorMessage: "You have a Metrics block, but it has not been connected to your 'When evaluate clicked' block!",
      error: true,
    };
  }
  else if (!metricsBlock) {
    return {
      errorMessage: "No 'Load Metrics' block has been added to the sandbox",
      error: true,
    };
  }

  // All checks passed
  return {
    error: false,
  };
};
