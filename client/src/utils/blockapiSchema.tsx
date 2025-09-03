import { UniqueIdentifier } from "@dnd-kit/core";
import { Block, Blocks } from "@/types/block";
import { DiagramType, DatasetType } from "@/types/diagram";

// might help to create a const Record mapping the layer block to its params
// if we add parameters for layer blocks in the future

export type Params = Record<string, string | number | boolean | string[] | number[]>;

// takes the Blocks dictionary and returns a list of only the layer blocks in the format of the DiagramType blocks field
const transformLayerBlocks = (
  defineModelBlock: Block,
  blocks: Blocks
): { block_id: string; order: number; params?: Params }[] => {
  const layerBlockIDs = defineModelBlock.internalIds || [];
  const resultBlocks: { block_id: string; order: number; params?: Params }[] = [];

  // this is to handle out_features = 1 for the last linear layer (for now)
  const linearLayerIDs = layerBlockIDs.filter((id) => blocks[id]?.type === "linear_layer");
  const lastLinearLayerID =
    linearLayerIDs.length > 0 ? linearLayerIDs[linearLayerIDs.length - 1] : null;

  layerBlockIDs.forEach((uniqueID, index) => {
    const block = blocks[uniqueID];
    if (!block) return;
    let params: Params = {};

    if (block.type === "linear_layer") {
      if (uniqueID === lastLinearLayerID) {
        params = { out_features: 1 }; // out_features for the last linear layer must be 1
      } else {
        params = { out_features: 64 }; // hardcoded as 64 for now
      }
    } else if (block.type === "softmax_activation") {
      params = { dim: 0 }; // hardcoded as 0th dimension now
    } else if (block.type === "dropout_layer") {
      params = { p: 0.3 }; // hardcoded dropout probability for now
    }

    // construct the block object
    resultBlocks.push({
      block_id: block.type || "",
      order: index,
      params,
    });
  });

  return resultBlocks;
};

export const buildDiagram = (blocks: Blocks, challenge: string): DiagramType => {
  // challenge is a parameter in order to select the right dataset
  // we must map the challenge slug to a dataset (as a DatasetType)
  const challengeToDataset: Record<string, DatasetType> = {
    "mushroom-binary-classification": "mushrooms",
    "weather-multi-classification": "weather"
  };

  // get dataset
  const dataset: DatasetType = challengeToDataset[challenge];

  // if "define_model" does not exist or is empty, returns [] for layerBlocks
  let layerBlocks: { block_id: string; order: number; params?: Params }[] = [];  

  // if "define_loss_function" does not exist or is empty, returns "" for lossfn
  let loss_fn = "";

  // if "load_metrics" does not exist or is empty, returns [] for evalFns
  const evalFns: string[] = [];

  // if "define_optimizer" does not exist or is empty, returns ""
  let optimizer = "";

  // only choose loss fn and optimizer blocks connected to the "when train clicked" block
  const trainStartBlock = Object.values(blocks).find(
    (block) => block?.type === "when_train_start"
  );
  if (trainStartBlock) {
    let currentBlockID: UniqueIdentifier | null = trainStartBlock.childId ?? null;

    // follow the chain of blocks
    while (currentBlockID !== null && blocks[currentBlockID]) {  
      const currentBlock: Block = blocks[currentBlockID];
      if (!currentBlock) break;

      if (currentBlock.type === "define_loss_function" && currentBlock.internalIds?.length) {
        loss_fn = blocks[currentBlock.internalIds[0]]?.type || "";  // extracts internal loss function block
      } else if (currentBlock.type === "define_optimizer" && currentBlock.internalIds?.length) {
        optimizer = blocks[currentBlock.internalIds[0]]?.type || "";  // // extracts internal optimizer block
      } else if (currentBlock.type === "define_model" && currentBlock.internalIds?.length) {  // extracts layer blocks
        layerBlocks = transformLayerBlocks(currentBlock, blocks);
      }
      
      currentBlockID = currentBlock.childId ?? null;  // move on to the next block in sequence
    }
  }

  // only choose eval fns connected to the "when evaluate clicked" block
  const defineEvalBlock = Object.values(blocks).find(
    (block) => block.type === "when_eval_start"
  );
  if (defineEvalBlock && defineEvalBlock.childId) {
    const currentBlock = blocks[defineEvalBlock.childId];

    // users can only add the "load_metrics" block to the eval block but will check this anyway
    if (currentBlock?.type === "load_metrics" && currentBlock.internalIds?.length) {
      currentBlock.internalIds.forEach((id: UniqueIdentifier) => {
        const metricBlock = blocks[id];
        if (metricBlock?.type) {
          evalFns.push(metricBlock.type); // adds all specified metrics
        }
      });
    }
  }

  const diagram: DiagramType = {
    blocks: layerBlocks,
    execution: "train", // might change later?
    dataset: dataset,
    optimizer: optimizer,
    loss_fn: loss_fn,
    evalFns: evalFns,
    lr: 0.001, // placeholder/hardcoded for now
    epochs: 20, // placeholder/hardcoded for now
  };

  return diagram;
};
