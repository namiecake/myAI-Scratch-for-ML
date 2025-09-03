import { UniqueIdentifier, useDroppable } from "@dnd-kit/core";
import "./block.css";
import { Blocks, BlockStatus, BlockType, blockTypeInformation } from "@/types/block";
import { checkBlockLogic } from "@/utils/blockLogic";
import { blockCategoryToColor } from "@/types/blockCategory";

export const DroppableBlock: React.FC<{
  id: UniqueIdentifier;
  status: BlockStatus;
  type: BlockType;
  allMovingIds?: UniqueIdentifier[];
  children?: React.ReactNode;
  internalDroppable: boolean;
  allBlocks: Blocks;
}> = ({ id, status, type, allMovingIds, internalDroppable, children, allBlocks }) => {
  const droppableId = internalDroppable ? `droppable-${id}-internal` : `droppable-${id}`;
  const { setNodeRef, isOver } = useDroppable({
    id: droppableId,
    data: { id },
  });

  const style: React.CSSProperties = {
    borderBottom: `6px solid ${
      status == "dropped" &&
      isOver &&
      allMovingIds &&
      !allMovingIds.includes(id) &&
      checkBlockLogic(allMovingIds[0], id, internalDroppable, allBlocks)
        ? blockCategoryToColor[blockTypeInformation[type].category].border
        : "transparent"
    }`,
    borderTop: `6px solid transparent`,
    height: "inherit",
    width: "fit-content",
  };

  return (
    <div ref={setNodeRef} style={style} className="droppable-block">
      {children}
    </div>
  );
};
