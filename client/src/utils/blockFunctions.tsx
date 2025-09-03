import { Block, Blocks, BlockStatus } from "@/types/block";
import { UniqueIdentifier } from "@dnd-kit/core";
import { Coordinates } from "@dnd-kit/core/dist/types";

/*
Function to add a block to the blocks object

Parameters:
- blocks: the current blocks object
- block: the block to add

Returns:
- the new blocks object with the block added
*/
export const addBlock = (blocks: Blocks, block: Block) => {
  const newBlocks: Blocks = { ...blocks, [block.id]: block };
  return newBlocks;
};

/*
Function to remove a block from the blocks object

Parameters:
- blocks: the current blocks object
- id: the id of the block to remove

Returns:
- the new blocks object with the block removed
*/
export const removeBlock = (blocks: Blocks, id: UniqueIdentifier) => {
  if (id in blocks) {
    const newBlocks = { ...blocks };
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete newBlocks[id];
    return newBlocks;
  }
  return blocks;
};

/*
Function to update the status of a block (available, dropped)

Parameters:
- blocks: the current blocks object
- id: the id of the block to update
- status: the new status of the block

Returns:
- the new blocks object with the block status updated
*/
export const updateBlockStatus = (blocks: Blocks, id: UniqueIdentifier, status: BlockStatus) => {
  if (id in blocks) {
    return {
      ...blocks,
      [id]: {
        ...blocks[id],
        status,
      },
    };
  }
  return blocks;
};

/*
Function to update the position of a block

Parameters:
- blocks: the current blocks object
- id: the id of the block to update
- position: the new position of the block

Returns:
- the new blocks object with the block position updated
*/
export const updateBlockPosition = (
  blocks: Blocks,
  id: UniqueIdentifier,
  position: Coordinates
) => {
  if (id in blocks) {
    return {
      ...blocks,
      [id]: {
        ...blocks[id],
        position,
      },
    };
  }
  return blocks;
};

/*
Function to link two blocks as parent/child

Parameters:
- blocks: the current blocks object
- parentId: the id of the parent block
- childId: the id of the child block

Returns:
- the new blocks object with the blocks linked
*/
export const linkBlocks = (
  blocks: Blocks,
  parentId: UniqueIdentifier,
  childId: UniqueIdentifier
): Blocks => {
  // make parent.child = child and child.parent = parent
  let newBlocks = blocks;
  if (parentId in newBlocks && childId in newBlocks) {
    newBlocks = {
      ...newBlocks,
      [parentId]: {
        ...newBlocks[parentId],
        childId: childId,
      },
      [childId]: {
        ...newBlocks[childId],
        parentId: parentId,
      },
    };
  }

  return newBlocks;
};

/*
Function to remove an internal block from a cBlock. Will also remove any children of the internal block from the cBlock.

Parameters:
- blocks: the current blocks object
- outerId: the id of the cBlock
- innerId: the id of the internal block to remove

Returns:
- the new blocks object with the internal block(s) removed
*/
export const removeInternalBlock = (
  blocks: Blocks,
  outerId: UniqueIdentifier,
  innerId: UniqueIdentifier
): Blocks => {
  const newBlocks = blocks;
  if (outerId in newBlocks && innerId in newBlocks) {
    // for innerId and any children, remove externalId and remove from internalIds
    let id = innerId;
    while (id) {
      newBlocks[id].externalId = undefined;
      newBlocks[outerId].internalIds?.splice(newBlocks[outerId].internalIds?.indexOf(id), 1);
      if (!newBlocks[id].childId) {
        break;
      }
      id = newBlocks[id].childId as UniqueIdentifier;
    }
  }
  return newBlocks;
};

/*
Function to unlink the parent/child relationship of two blocks. Will also remove the block and its children from any external cBlock unless removeInternal is set to false.

Parameters:
- blocks: the current blocks object
- parentId: the id of the parent block
- childId: the id of the child block
- removeInternal: boolean to remove internal blocks from any external cBlock. Default is true. This is applicable if the child block is an internal block and
is being unlinked from another internal block.

Returns:
- the new blocks object with the blocks unlinked
*/
export const unlinkBlocks = (
  blocks: Blocks,
  parentId: UniqueIdentifier,
  childId: UniqueIdentifier,
  removeInternal = true
): Blocks => {
  let newBlocks = blocks;
  if (parentId in newBlocks && childId in newBlocks) {
    // remove internal blocks
    if (newBlocks[childId].externalId && removeInternal) {
      newBlocks = removeInternalBlock(
        newBlocks,
        newBlocks[childId].externalId as UniqueIdentifier,
        childId
      );
    }
    // remove parent-child relationship
    newBlocks = {
      ...newBlocks,
      [parentId]: {
        ...newBlocks[parentId],
        childId: undefined,
      },
      [childId]: {
        ...newBlocks[childId],
        parentId: undefined,
      },
    };
  }
  return newBlocks;
};

/*
Function to add an internal block to a cBlock. The block can be placed on the cBlock, in which case it will be added as the first internal block, or within the existing internal block stack of the cBlock.

Parameters:
- blocks: the current blocks object
- outerId: the id of the cBlock
- innerId: the id of the internal block to add
- internalIdDroppedOn: the id of the internal block to add the new block after. If not provided, the new block will be added as the first internal block.

Returns:
- the new blocks object with the internal block added
*/
export const addInternalBlock = (
  blocks: Blocks,
  outerId: UniqueIdentifier,
  innerId: UniqueIdentifier,
  internalIdDroppedOn?: UniqueIdentifier
): Blocks => {
  let newBlocks = blocks;

  if (newBlocks[innerId].externalId == outerId) {
    return newBlocks;
  }

  // get all children of innerId
  const allMovingIds = [innerId];
  let id = innerId;
  while (newBlocks[id].childId) {
    id = newBlocks[id].childId as UniqueIdentifier;
    allMovingIds.push(id);
  }

  // for all movingIds, set their externalId to outerId
  for (const id of allMovingIds) {
    newBlocks = {
      ...newBlocks,
      [id]: {
        ...newBlocks[id],
        externalId: outerId,
      },
    };
  }

  // update outerId block to include all movingIds as internalIds
  // case 1: parent has no existing internal blocks
  if (!newBlocks[outerId].internalIds || newBlocks[outerId].internalIds.length === 0) {
    newBlocks = {
      ...newBlocks,
      [outerId]: {
        ...newBlocks[outerId],
        internalIds: allMovingIds,
      },
    };
  }
  // case 2: parent has existing internal blocks. Must add allMovingIds to internalIds in the appropriate position
  else {
    // case 2a: set allMovingIds as the first internal blocks
    if (!internalIdDroppedOn) {
      const newChildBlockId = newBlocks[outerId].internalIds[0];
      newBlocks = linkBlocks(newBlocks, allMovingIds[allMovingIds.length - 1], newChildBlockId);
      newBlocks = {
        ...newBlocks,
        [outerId]: {
          ...newBlocks[outerId],
          internalIds: [...allMovingIds, ...(newBlocks[outerId].internalIds || [])],
        },
      };
    }
    // case 2b: set allMovingIds within the existing internal blocks
    else {
      // if new parent block has a child, unlink them and attach child to final block in moving stack
      let childId = null;
      if (newBlocks[internalIdDroppedOn].childId) {
        childId = newBlocks[internalIdDroppedOn].childId;
        newBlocks = unlinkBlocks(
          newBlocks,
          internalIdDroppedOn,
          childId as UniqueIdentifier,
          false
        );
        // link the final block in the moving stack to the old child block
        const final_child_id = allMovingIds[allMovingIds.length - 1];
        newBlocks = linkBlocks(newBlocks, final_child_id, childId as UniqueIdentifier);
      }
      // link block to new parent block
      newBlocks = linkBlocks(newBlocks, internalIdDroppedOn as UniqueIdentifier, allMovingIds[0]);
      // update internalIds of outerId
      const internalIds = newBlocks[outerId].internalIds as UniqueIdentifier[];

      newBlocks = {
        ...newBlocks,
        [outerId]: {
          ...newBlocks[outerId],
          internalIds: [
            ...internalIds.slice(0, internalIds.indexOf(internalIdDroppedOn) + 1),
            ...allMovingIds,
            ...internalIds.slice(internalIds.indexOf(internalIdDroppedOn) + 1),
          ],
        },
      };
    }
  }
  return newBlocks;
};
