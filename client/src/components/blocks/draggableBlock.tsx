import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Coordinates, UniqueIdentifier } from "@dnd-kit/core/dist/types";
import { Block, Blocks, BlockType, blockTypeInformation, MovingStack } from "../../types/block";
import "./block.css";
import { StandardBlock } from "./standardBlock";
import { CBlock } from "./cBlock";
import { StartBlock } from "./startBlock";

export const DraggableBlock: React.FC<
  Block & {
    movingStackHeadCoords?: Coordinates;
    movingStackHeadId?: UniqueIdentifier;
    movingStackCoords?: MovingStack;
    droppedBlocks?: Blocks;
    allBlocks: Blocks;
  }
> = ({
  id,
  type,
  status,
  position,
  movingStackCoords,
  droppedBlocks,
  movingStackHeadId,
  movingStackHeadCoords,
  allBlocks,
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: id });

  let allMovingIds = [] as UniqueIdentifier[];
  if (movingStackCoords) {
    allMovingIds = Object.keys(movingStackCoords).map((id) => parseInt(id));
  }

  if (transform) {
    transform.scaleX = 1;
    transform.scaleY = 1;
  }

  let zIndex = 1;
  if ((allMovingIds && allMovingIds.includes(id)) || isDragging) {
    zIndex = 100;
  } else if (blockTypeInformation[type].layout == "standard") {
    zIndex = 10;
  }

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    opacity: (allMovingIds && allMovingIds.includes(id)) || isDragging ? 0.7 : 1,
    cursor: "grab",
    zIndex: zIndex,
  };

  // Update position of block
  const elementCoords = position ?? { x: 0, y: 0 };
  // if block is in moving stack and is not the head block
  if (
    allMovingIds.includes(id) &&
    id !== movingStackHeadId &&
    movingStackHeadCoords &&
    movingStackCoords
  ) {
    elementCoords.x = movingStackHeadCoords.x + movingStackCoords[id].x;
    elementCoords.y = movingStackHeadCoords.y + movingStackCoords[id].y;
  }

  const renderBlock = (type: BlockType) => {
    switch (blockTypeInformation[type].layout) {
      case "standard":
        return (
          <StandardBlock
            id={id}
            type={type}
            status={status}
            allMovingIds={allMovingIds}
            allBlocks={allBlocks}
          />
        );
      case "cBlock":
        return (
          <CBlock
            id={id}
            type={type}
            status={status}
            allMovingIds={allMovingIds}
            droppedBlocks={droppedBlocks}
            allBlocks={allBlocks}
          />
        );
      case "startBlock":
        return (
          <StartBlock
            id={id}
            type={type}
            status={status}
            allMovingIds={allMovingIds}
            droppedBlocks={droppedBlocks}
            allBlocks={allBlocks}
          />
        );
    }
  };

  return (
    <div
      id={id.toString()}
      ref={setNodeRef}
      className="draggable-block"
      style={{
        position: status == "available" ? "relative" : "absolute",
        left: status == "dropped" ? elementCoords.x : 0,
        top: status == "dropped" ? elementCoords.y : 0,
        ...style,
      }}
      {...attributes}
      {...listeners}
    >
      {renderBlock(type)}
    </div>
  );
};
