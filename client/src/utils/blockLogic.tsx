import { Blocks, blockTypeInformation } from "@/types/block";
import { UniqueIdentifier } from "@dnd-kit/core";

export const checkBlockLogic = (
  draggableId: UniqueIdentifier,
  droppableId: UniqueIdentifier,
  isInternal: boolean,
  blocks: Blocks
): boolean => {
  const draggable = blocks[draggableId];
  const droppable = blocks[droppableId];

  // Get types
  const droppableType = droppable.type;

  // Get categories from our block type information.
  const draggableCategory = blockTypeInformation[draggable.type].category;
  const droppableCategory = blockTypeInformation[droppable.type].category;

  // if droppable is internal
  if (isInternal) {
    // INTERNAL BLOCK RULES
    // 1. The draggable block must have the same category as the droppable block.
    if (draggableCategory != droppableCategory) {
      return false;
    }

    // 2. For all categories except "layer", only one block of a given BlockType may exist in the internal area.
    if (draggableCategory != "layer") {
      if (
        droppable.internalIds &&
        droppable.internalIds.some((internalId) => blocks[internalId]?.type === draggable.type)
      ) {
        return false;
      }
    }

    // 3. For the "loss" and "algorithm" categories, allow only one block in total within the c-block.
    if (
      (draggableCategory == "loss" || draggableCategory == "algorithm") &&
      droppable.internalIds
    ) {
      if (droppable.internalIds.length > 0) {
        return false;
      }
    }

    // 4. No c-blocks within c-blocks
    if (
      blockTypeInformation[draggable.type].layout == "cBlock" &&
      blockTypeInformation[droppable.type].layout == "cBlock"
    ) {
      return false;
    }
  } else {
    // CHILD BLOCK RULES

    // DRAGGABLE IS A C-BLOCK
    if (blockTypeInformation[draggable.type].layout == "cBlock") {
      // 1. Enforce a hierarchy using categories (enforce top-down order in left panel)
      if (draggableCategory == "data" && droppableType != "when_train_start") {
        return false;
      }
      if (draggableCategory == "layer" && droppableCategory != "data") {
        return false;
      }
      if (draggableCategory == "loss" && droppableCategory != "layer") {
        return false;
      }
      if (draggableCategory == "algorithm" && droppableCategory != "loss") {
        return false;
      }
      if (draggableCategory == "evaluation" && droppableType !== "when_eval_start") {
        return false;
      }
      // 2. C-blocks can't be dropped on standard blocks
      if (blockTypeInformation[droppable.type].layout == "standard") {
        return false;
      }
    }

    // 2. Standard blocks can't follow c-blocks or start blocks
    if (
      blockTypeInformation[draggable.type].layout == "standard" &&
      blockTypeInformation[droppable.type].layout != "standard"
    ) {
      return false;
    }

    // 3. If blocks are both standard, they must be the same color
    if (
      blockTypeInformation[draggable.type].layout == "standard" &&
      blockTypeInformation[droppable.type].layout == "standard"
    ) {
      if (draggableCategory != droppableCategory) {
        // different colors
        return false;
      }
      if (draggableCategory == "loss" || draggableCategory == "algorithm") {
        // adding two blocks that don't make sense
        return false;
      }
    }
  }

  return true;
};
