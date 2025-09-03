import React from "react";
import { useDroppable, UniqueIdentifier } from "@dnd-kit/core";
import { Blocks, MovingStack } from "../../../types/block";
import { DraggableBlock } from "../../../components/blocks/draggableBlock";
import { Coordinates } from "@dnd-kit/core/dist/types";

export const DroppableArea: React.FC<{
  allBlocks: Blocks;
  droppedBlocks: Blocks;
  movingStackHeadId?: UniqueIdentifier;
  movingStackHeadCoords?: Coordinates;
  movingStackCoords?: MovingStack;
}> = ({
  droppedBlocks,
  movingStackHeadCoords,
  movingStackCoords,
  movingStackHeadId,
  allBlocks,
}) => {
  const { setNodeRef } = useDroppable({ id: "droppable-area" });

  const style: React.CSSProperties = {
    height: "100%",
    width: "100%",
    position: "relative",
    overflowY: "scroll",
    overflowX: "hidden",
  };

  return (
    <div ref={setNodeRef} style={style} id="block-sandbox">
      <p style={{ textAlign: "center", color: "gray" }}>Drop Blocks Here</p>
      {Object.entries(droppedBlocks).map(([, block]) => (
        <DraggableBlock
          key={block.id}
          {...block}
          movingStackHeadId={movingStackHeadId}
          movingStackHeadCoords={movingStackHeadCoords}
          movingStackCoords={movingStackCoords}
          allBlocks={allBlocks}
          droppedBlocks={droppedBlocks}
        />
      ))}
    </div>
  );
};
