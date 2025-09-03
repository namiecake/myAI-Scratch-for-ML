import { Block, BlockLayout, Blocks, blockTypeInformation, MovingStack } from "@/types/block";
import { DragEndEvent, DragMoveEvent, DragStartEvent, UniqueIdentifier } from "@dnd-kit/core";
import {
  addBlock,
  addInternalBlock,
  linkBlocks,
  removeBlock,
  removeInternalBlock,
  unlinkBlocks,
  updateBlockPosition,
  updateBlockStatus,
} from "./blockFunctions";
import {
  STANDARD_TOP_OF_BLOCK,
  STANDARD_BOTTOM_OF_BLOCK,
  CBLOCK_BOTTOM_OF_BLOCK2,
  CBLOCK_TOP_OF_BLOCK,
  CBLOCK_XSTART_OF_INDENT,
  CBLOCK_BOTTOM_OF_BLOCK1,
  CBLOCK_HEIGHT_OF_EXTRA_INTERNAL_BLOCK,
  STARTBLOCK_BOTTOM_OF_BLOCK,
  STARTBLOCK_TOP_OF_CURVE,
} from "@/types/blockStyling";
import { ClientRect, Coordinates } from "@dnd-kit/core/dist/types";
import { checkBlockLogic } from "./blockLogic";

/*
Function to get the absolute coordinates of a block relative to the position of the sandbox.

Parameters:
- offsets: the current position of the block

Returns:
- the absolute position of the block relative to the sandbox
*/
const getRelativeCoordsInSandbox = (offsets: ClientRect | DOMRect | undefined | null) => {
  const coords = { x: 0, y: 0 };
  const droppableAreaOffsets = document.getElementById("block-sandbox")?.getBoundingClientRect();
  coords.x = offsets && droppableAreaOffsets ? offsets.left - droppableAreaOffsets.x : 0;
  coords.y = offsets && droppableAreaOffsets ? offsets.top - droppableAreaOffsets.y : 0;
  return coords;
};

/*
Funcion to handle the movement of a block during a drag event.
Given the current position of the block, will calculate the new absolute position of the block
relative to the sandbox.

Parameters:
- event: the drag move event

Returns:
- the new position of the block relative to the droppable area sandbox
*/
export const dragMoveHandler = (event: DragMoveEvent) => {
  const offsets = event.active.rect.current.translated;
  return getRelativeCoordsInSandbox(offsets);
};

/*
Function to handle the start of a drag event.
Given the block that is being dragged, will calculate the position to all blocks
in the moving stack (including internal blocks) relative to the head block.

Parameters:
- blocks: the current state of all blocks
- event: the drag start event

Returns:
- movingStack: an object containing the relative position of all blocks in the moving stack
- movingStackHeadId: the id of the head block in the moving stack
- movingStackHeadCoordinates: the position coordinates of the head block in the moving stack
- allMovingExternalIds: an array of all external ids in the moving stack (internal block ids are obviously not included here)
*/
export const dragStartHandler = (
  blocks: Blocks,
  event: DragStartEvent
): {
  movingStack: MovingStack;
  movingStackHeadId: UniqueIdentifier;
  movingStackHeadCoordinates: Coordinates;
  allMovingExternalIds: UniqueIdentifier[];
} => {
  const movingStackHeadId = event.active.id;
  const movingStackHeadCoordinates = blocks[movingStackHeadId].position as Coordinates;
  const movingStack: MovingStack = { [movingStackHeadId]: { x: 0, y: 0 } };
  let allMovingExternalIds: UniqueIdentifier[] = [];

  // Loop until no more children
  let currentBlockId = movingStackHeadId;
  while (currentBlockId) {
    allMovingExternalIds = [...allMovingExternalIds, currentBlockId];

    // Check if there are internal blocks
    const internalIds = blocks[currentBlockId].internalIds;
    let numberOfInternalElements = undefined;
    if (internalIds) {
      numberOfInternalElements = internalIds.length;
      // Add internal blocks to movingStack
      for (const [index, internalId] of internalIds.entries()) {
        // Calculate relative position of internal block
        const coords = calculate_block_position_in_stack(
          movingStack[currentBlockId],
          blockTypeInformation[blocks[currentBlockId].type].layout,
          index,
          numberOfInternalElements
        );
        movingStack[internalId] = coords;
      }
    }
    // If child, add child to movingStack
    const childId = blocks[currentBlockId].childId;
    if (childId) {
      const coords = calculate_block_position_in_stack(
        movingStack[currentBlockId],
        blockTypeInformation[blocks[currentBlockId].type].layout,
        undefined,
        numberOfInternalElements
      );
      movingStack[childId] = coords;
      currentBlockId = childId;
    } else {
      break;
    }
  }

  return { movingStack, movingStackHeadId, movingStackHeadCoordinates, allMovingExternalIds };
};

/*
Function to handle the end of a drag event.
When a block is dropped, it will calculate the new absolute position of every block the moving stack.

Parameters:
- blocks: the current state of all blocks
- event: the drag start event
- idCount: the current id counter for creating new blocks
- movingStackCoords: an object containing the relative position of all blocks in the moving stack (created onDragStart)
- allMovingExternalIds: an array of all external ids in the moving stack (created onDragStart)

Returns:
- newBlocks: the updated state of all blocks
- idCounter: the updated id counter for creating new blocks
*/
export const dragEndHandler = (
  blocks: Blocks,
  event: DragEndEvent,
  idCount: number,
  movingStackCoords: MovingStack,
  allMovingExternalIds: UniqueIdentifier[],
  addNotification: (notification: { type: "error" | "warning" | "success" | "info"; message: string }) => void
): {
  newBlocks: Blocks;
  idCounter: number;
} => {
  const { active, over } = event;
  let newBlocks: Blocks = blocks;
  let idCounter = idCount;
  const headBlock = newBlocks[active.id];
  const allMovingIds = Object.keys(movingStackCoords).map((id) => parseInt(id));

  // Prevent multiple start_of_model blocks
  if (
    headBlock.type === "when_train_start" &&
    headBlock.status == "available" &&
    Object.values(newBlocks).some((b) => b.type === "when_train_start" && b.status == "dropped")
  ) {
    addNotification({
      type: "error",
      message: "Only one 'When train clicked' block can be placed at a time.",
    });
    return { newBlocks, idCounter };
  }

  // Prevent multiple evaluate blocks
  if (
    headBlock.type === "when_eval_start" &&
    headBlock.status == "available" &&
    Object.values(newBlocks).some((b) => b.type === "when_eval_start" && b.status == "dropped")
  ) {
    addNotification({
      type: "error",
      message: "Only one 'When evaluate clicked' block can be placed at a time.",
    });
    return { newBlocks, idCounter };
  }

  // Create new block
  if (headBlock.status === "available") {
    const newBlock: Block = {
      type: headBlock.type,
      status: "available",
      id: idCounter,
    };
    newBlocks = addBlock(newBlocks, newBlock);
    idCounter += 1;
  }

  // Check to see if block is in bounds of sandbox. If not, remove it
  const sandbox = document.getElementById("block-sandbox");
  if (sandbox) {
    const sandbox_coords = sandbox.getBoundingClientRect();
    const element_id =
      blocks[active.id].status == "available" ? "drag-overlay" : active.id.toString();
    const element_coords = document.getElementById(element_id)?.getBoundingClientRect();
    if (element_coords) {
      if (
        element_coords.left < sandbox_coords.left ||
        element_coords.right > sandbox_coords.right ||
        element_coords.top < sandbox_coords.top ||
        element_coords.bottom > sandbox_coords.bottom
      ) {
        // Need to delete all blocks in moving stack
        for (const id of allMovingIds) {
          newBlocks = removeBlock(newBlocks, id);
        }
        return { newBlocks, idCounter };
      }
    }
  }

  // Block was dropped in sandbox valid droppable zone
  if (over) {
    // update position for block and for all descendents
    if (blocks[active.id].status === "available") {
      // block is coming from left panel: use coordinates of drag overlay
      const offsets = document.getElementById("drag-overlay")?.getBoundingClientRect();
      const coords = getRelativeCoordsInSandbox(offsets);
      newBlocks = updateBlockStatus(newBlocks, active.id, "dropped");
      newBlocks = updateBlockPosition(newBlocks, active.id, coords);
    } else {
      for (const id of allMovingIds) {
        const offsets = document.getElementById(id.toString())?.getBoundingClientRect();
        const coords = getRelativeCoordsInSandbox(offsets);

        newBlocks = updateBlockStatus(newBlocks, id, "dropped");
        newBlocks = updateBlockPosition(newBlocks, id, coords);
      }
    }

    // Block was dropped on droppable-block that isn't in current movingStack
    if (
      over.id !== "droppable-area" &&
      over.data.current &&
      !allMovingIds.some(
        (id) => `droppable-${id}` === over.id || `droppable-${id}-internal` === over.id
      )
    ) {
      // Prevent start block from being dropped on another block
      if (blockTypeInformation[headBlock.type].layout == "startBlock") {
        return { newBlocks, idCounter };
      }

      // Check block connecting logic
      if (
        !checkBlockLogic(
          active.id,
          over.data.current.id,
          over.id.toString().includes("internal"),
          newBlocks
        )
      ) {
        return { newBlocks, idCounter };
      }

      // if block is child, unlink from parent
      if (blocks[active.id].parentId) {
        newBlocks = unlinkBlocks(
          newBlocks,
          newBlocks[active.id].parentId as UniqueIdentifier,
          active.id
        );
      }
      // if block was internal block, unlink from external block
      if (newBlocks[active.id].externalId) {
        newBlocks = removeInternalBlock(
          newBlocks,
          newBlocks[active.id].externalId as UniqueIdentifier,
          active.id
        );
      }
      // attaching block to cBlock: add block as the first internal block of the cBlock
      if (over.id.toString().includes("internal")) {
        newBlocks = addInternalBlock(newBlocks, over.data.current.id, active.id);
      }
      // attaching block to internalBlock: add block
      else if (newBlocks[over.data.current.id].externalId) {
        newBlocks = addInternalBlock(
          newBlocks,
          newBlocks[over.data.current.id].externalId as UniqueIdentifier,
          active.id,
          over.data.current.id
        );
      } else {
        // if new parent block has a child, unlink them and attach child to final block in moving stack
        let childId = null;
        if (newBlocks[over.data.current.id].childId) {
          childId = newBlocks[over.data.current.id].childId;
          newBlocks = unlinkBlocks(newBlocks, over.data.current.id, childId as UniqueIdentifier);
          // link the final block in the moving stack to the old child block
          let final_child_id = active.id;
          if (allMovingExternalIds && allMovingExternalIds.length > 1) {
            final_child_id = allMovingExternalIds[allMovingExternalIds.length - 1];
          }
          newBlocks = linkBlocks(newBlocks, final_child_id, childId as UniqueIdentifier);
        }
        // link block to new parent block
        newBlocks = linkBlocks(newBlocks, over.data.current.id as UniqueIdentifier, active.id);
      }
    }
    // Block was not dropped on a droppable block - will become new head block
    else {
      // if block does not have a parent, do nothing
      // if block is internalblock, unlink from external
      if (newBlocks[active.id].externalId) {
        newBlocks = removeInternalBlock(
          newBlocks,
          newBlocks[active.id].externalId as UniqueIdentifier,
          active.id
        );
      }
      // if block is child, unlink from parent
      if (newBlocks[active.id].parentId) {
        newBlocks = unlinkBlocks(
          newBlocks,
          newBlocks[active.id].parentId as UniqueIdentifier,
          active.id
        );
      }
    }
  }
  // Block was not dropped in valid droppable zone
  else {
    // Remove all blocks in moving stack
    for (const id of allMovingIds) {
      newBlocks = removeBlock(newBlocks, id);
    }
  }

  // Set all sets of blocks in correct positions
  const droppedBlocks = Object.values(newBlocks).filter((block) => block.status === "dropped");
  const parentBlocks = droppedBlocks.filter((block) => !block.parentId && !block.externalId);
  for (const parentBlock of parentBlocks) {
    let currentBlockId = parentBlock.id as UniqueIdentifier;
    while (currentBlockId) {
      // Check if there are internal blocks
      const internalIds = newBlocks[currentBlockId]?.internalIds;
      let numberOfInternalElements = undefined;

      if (internalIds) {
        numberOfInternalElements = internalIds.length;
        // Update position of each internal element
        for (const [index, internalId] of internalIds.entries()) {
          const coords = calculate_block_position_in_stack(
            newBlocks[currentBlockId].position as Coordinates,
            blockTypeInformation[newBlocks[currentBlockId].type].layout,
            index,
            numberOfInternalElements
          );
          newBlocks = updateBlockPosition(newBlocks, internalId, coords);
        }
      }
      // If child, update position of child
      const childId = newBlocks[currentBlockId]?.childId;
      if (childId) {
        const coords = calculate_block_position_in_stack(
          newBlocks[currentBlockId].position as Coordinates,
          blockTypeInformation[newBlocks[currentBlockId].type].layout,
          undefined,
          numberOfInternalElements
        );
        newBlocks = updateBlockPosition(newBlocks, childId, coords);
        currentBlockId = childId;
      } else {
        break;
      }
    }
  }

  return {
    newBlocks,
    idCounter,
  };
};

/*
Function to calculate the position of a block in a stack given its parent coordinates. Can be used for 
relative or absolute positioning. If the parent block is set as {0, 0}, the child block's coords will be 
the relative position of the child block to the parent. If the parent block is set as {x, y}, the child
block's coords will be the absolute position of the child block.

The position of the block is determined by the layout of the parent block, whether it has internal blocks,
and what index the block is in the internal block list.

Parameters:
- parent_position: the coordinates of the parent block
- parent_layout: the layout of the parent block (standard or cBlock)
- indexInInternal (optional): if applicable, the index of the block in the internal block list
- numberOfInternalElements (optional): if applicable, the number of internal elements in the parent block

Returns:
- the coordinates of the block
*/
export const calculate_block_position_in_stack = (
  parent_position: Coordinates,
  parent_layout: BlockLayout,
  indexInInternal?: number,
  numberOfInternalElements?: number
): Coordinates => {
  const child_coords = { x: 0, y: 0 };
  if (parent_position) {
    if (parent_layout == "standard") {
      child_coords.x = parent_position.x;
      child_coords.y = parent_position.y + (STANDARD_BOTTOM_OF_BLOCK - STANDARD_TOP_OF_BLOCK);
    } else if (parent_layout == "startBlock") {
      child_coords.x = parent_position.x;
      child_coords.y = parent_position.y + (STARTBLOCK_BOTTOM_OF_BLOCK - STARTBLOCK_TOP_OF_CURVE);
    } else if (parent_layout == "cBlock" && (indexInInternal == 0 || indexInInternal)) {
      child_coords.x = parent_position.x + CBLOCK_XSTART_OF_INDENT - 4;
      child_coords.y =
        parent_position.y +
        (CBLOCK_BOTTOM_OF_BLOCK1 - CBLOCK_TOP_OF_BLOCK) +
        indexInInternal * CBLOCK_HEIGHT_OF_EXTRA_INTERNAL_BLOCK;
    } else if (parent_layout == "cBlock" && !indexInInternal) {
      child_coords.x = parent_position.x;
      child_coords.y =
        parent_position.y +
        (CBLOCK_BOTTOM_OF_BLOCK2 -
          CBLOCK_TOP_OF_BLOCK +
          (numberOfInternalElements ? numberOfInternalElements - 1 : 0) *
            CBLOCK_HEIGHT_OF_EXTRA_INTERNAL_BLOCK);
    }
  }
  return child_coords;
};
