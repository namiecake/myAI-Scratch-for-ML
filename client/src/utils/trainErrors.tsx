import { Blocks } from "@/types/block";
import { DiagramType } from "@/types/diagram";

export const checkForTrainErrors = (
  data: DiagramType,
  droppedBlocks: Blocks
): {
  errorMessage?: string;
  error: boolean;
} => {
  const attachedBlocks = new Set<string>(); // all blocks attached to train
  let attachedDataBlock = null;

  // Check 1: no when train start block
  const trainStartBlock = Object.values(droppedBlocks).find(
    (block) => block.type === "when_train_start"
  );
  if (!trainStartBlock) {
    return {
      errorMessage: "No 'When train clicked' block has been added to the sandbox",
      error: true,
    };
  } else {
    // add blocks to attachedBlocks
    let currentBlockId = trainStartBlock.childId;
  
    // traverse the chain of blocks connected under "when_train_start"
    while (currentBlockId && droppedBlocks[currentBlockId]) {
      attachedBlocks.add(droppedBlocks[currentBlockId].type);  // add the string name

      // if a data block is attached, store it since load data errors are more specific
      if (droppedBlocks[currentBlockId].type === "load_data") {
        attachedDataBlock = droppedBlocks[currentBlockId];
      }

      currentBlockId = droppedBlocks[currentBlockId].childId; // move to next block
    }
  }

  // Check 2: no data blocks
  const dataBlock = Object.values(droppedBlocks).find((block) => block.type === "load_data");
  if (!dataBlock) {  // note: dataBlock could be an array if multiple load data blocks exist
    return {
      errorMessage: "No 'Load Data' block has been added to the sandbox",
      error: true,
    };
  } else if (!attachedDataBlock) {
    return {
      errorMessage: "You have a Data block, but it has not been connected to your 'When train clicked' block!",
      error: true,
    };
  }
  else {  // a 'load data' block is attached to 'when train clicked'
    const dataBlockInternalIds = attachedDataBlock.internalIds;
    const loadDataChecks = {
      "Choose Dataset": false,
      "Define Labels": false,
      "Feature Extraction": false,
      "Train Test Split": false,
    };
    if (dataBlockInternalIds) {
      for (const id of dataBlockInternalIds) {
        if (droppedBlocks[id].type == "choose_dataset") {
          loadDataChecks["Choose Dataset"] = true;
        }
        if (droppedBlocks[id].type == "define_labels") {
          loadDataChecks["Define Labels"] = true;
        }
        if (droppedBlocks[id].type == "feature_extraction") {
          loadDataChecks["Feature Extraction"] = true;
        }
        if (droppedBlocks[id].type == "train_test_split") {
          loadDataChecks["Train Test Split"] = true;
        }
      }
    }
    for (const [key, val] of Object.entries(loadDataChecks)) {
      if (!val) {
        return {
          errorMessage: `No '${key}' block has been added to the 'Load Data' block`,
          error: true,
        };
      }
    }
  }
  // Check 3: no defined model layers
  const defineModelBlock = Object.values(droppedBlocks).find((block) => block.type === "define_model");
  if (!attachedBlocks.has("define_model") && defineModelBlock) {
    return {
      errorMessage: "You have a Model block, but it has not been connected to your 'When train clicked' block!",
      error: true,
    };
  }
  else if (data.blocks.length === 0) {
    return {
      errorMessage: "No layers have been added to the model",
      error: true,
    };
  }

  // Check 4: no loss function
  const lossFnBlock = Object.values(droppedBlocks).find((block) => block.type === "define_loss_function");
  if (!attachedBlocks.has("define_loss_function") && lossFnBlock) {
    return {
      errorMessage: "You have a Loss Function block, but it has not been connected to your 'When train clicked' block!",
      error: true,
    };
  }
  else if (data.loss_fn === "") {
    return {
      errorMessage: "No loss function has been defined",
      error: true,
    };
  }
  // Check 5: no optimizer
  const optimizerBlock = Object.values(droppedBlocks).find((block) => block.type === "define_optimizer");
  if (!attachedBlocks.has("define_optimizer") && optimizerBlock) {
    return {
      errorMessage: "You have an Optimizer block, but it has not been connected to your 'When train clicked' block!",
      error: true,
    };
  }
  else if (data.optimizer === "") {
    return {
      errorMessage: "No learning algorithm (optimizer) has been defined",
      error: true,
    };
  }

  // All checks passed
  return {
    error: false,
  };
};

