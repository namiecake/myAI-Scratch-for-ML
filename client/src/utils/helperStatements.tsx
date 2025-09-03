import { Blocks } from "@/types/block";
import { DiagramType } from "@/types/diagram";
import { TrainingStatus } from "@/types/training";


export const helperStatements = (
 data: DiagramType,
 droppedBlocks: Blocks,
 trainingStatus: TrainingStatus
): {
 errorMessage?: string;
 error: boolean;
} => {
 if (trainingStatus === "result") {
   const defineModelBlock = Object.values(droppedBlocks).find(
     (block) => block.type === "when_eval_start"
   );
   // Check 1: no when evaluate block
   if (!defineModelBlock) {
     return {
       errorMessage: "🎉 Fantastic job training your model! Ready to see how well it performs? Let's add a 'When evaluate clicked' block to get started!",
       error: true,
     };
   }
   // When evaluate block exists, prompt user to add metrics
   return {
     errorMessage: "🎯 Almost there! Add the metrics you want to measure and click evaluate. Your results will appear in the bottom right section.",
     error: true,
   };
 } else if (trainingStatus === "training") {
  return {
    errorMessage: "⚡ Your model is training! Watch its progress in real-time in the top right section.",
    error: true,
  };
 } else if (trainingStatus === "error") {
  return {
    errorMessage: "🔧 Don't worry! There's an error we can fix. Check the error message and let's adjust your model accordingly.",
    error: true,
  };
 }

  // Check 1: no when train start block
  const defineModelBlock = Object.values(droppedBlocks).find(
    (block) => block.type === "when_train_start"
  );
  if (!defineModelBlock) {
    return {
      errorMessage: "👋 Let's build something amazing! Start by dragging in a 'When train clicked' block",
      error: true,
    };
  }
  // Check 2: no data blocks
  const dataBlock = Object.values(droppedBlocks).find((block) => block.type === "load_data");
  if (!dataBlock) {
    return {
      errorMessage: "📊 Time to add some data! Drag in a 'Load Data' block to prepare your training data",
      error: true,
    };
  } else {
    const dataBlockInternalIds = dataBlock.internalIds;
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
          errorMessage: `📝 Looking good! Now add a '${key}' block to your 'Load Data' block`,
          error: true,
        };
      }
    }
  }
  // Check 3: no defined model layers
  if (data.blocks.length === 0) {
    return {
      errorMessage: "🏗️ Time to design your model! Add some layers to build its structure",
      error: true,
    };
  }
  // Check 4: no loss function
  if (data.loss_fn === "") {
    return {
      errorMessage: "📈 Great progress! Now define a loss function to help your model learn",
      error: true,
    };
  }
  // Check 5: no optimizer
  if (data.optimizer === "") {
    return {
      errorMessage: "⚙️ Almost ready! Choose an optimizer to fine-tune your model's learning process",
      error: true,
    };
  }

  // All checks passed
  return {
    error: false,
  };
};
