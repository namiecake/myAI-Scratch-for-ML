import { Block, Blocks, blockTypeInformation } from "@/types/block";
import { blockCategoryToColor } from "@/types/blockCategory";
import {
  CBLOCK_BOTTOM_OF_BLOCK2,
  CBLOCK_BOTTOM_OF_DIVET1,
  CBLOCK_BOTTOM_OF_DIVET2,
  CBLOCK_BOTTOM_OF_SVG,
  CBLOCK_HEIGHT_OF_EXTRA_INTERNAL_BLOCK,
  CBLOCK_TOP_OF_BLOCK2,
} from "@/types/blockStyling";
import { UniqueIdentifier } from "@dnd-kit/core/dist/types";
import { DroppableBlock } from "./droppableBlock";
import { useEffect, useRef, useState } from "react";

export const CBlock: React.FC<
  Block & {
    allMovingIds?: UniqueIdentifier[];
    droppedBlocks?: Blocks;
    allBlocks: Blocks;
  }
> = ({ id, type, status, allMovingIds, droppedBlocks, allBlocks }) => {
  const textRef = useRef<HTMLParagraphElement | null>(null);
  const blockRef = useRef<HTMLParagraphElement | null>(null);
  const [textWidth, setTextWidth] = useState(100); // Default width
  const [blockWidth, setBlockWidth] = useState(100); // Default width

  useEffect(() => {
    if (textRef.current) {
      setTextWidth(textRef.current.clientWidth);
    }
    if (blockRef.current) {
      setBlockWidth(blockRef.current.clientWidth);
    }
  }, [blockTypeInformation, type]);

  let numberOfInternalElements = 1;
  if (droppedBlocks && droppedBlocks[id] && droppedBlocks[id].internalIds) {
    numberOfInternalElements = droppedBlocks[id].internalIds.length;
  }

  return (
    <>
      <svg
        style={{
          width: `${blockWidth + 24}px`,
          height:
            CBLOCK_BOTTOM_OF_SVG +
            Math.max(numberOfInternalElements - 1, 0) * CBLOCK_HEIGHT_OF_EXTRA_INTERNAL_BLOCK,
        }}
      >
        <path
          fill={blockCategoryToColor[blockTypeInformation[type].category].background}
          stroke={blockCategoryToColor[blockTypeInformation[type].category].border}
          style={{
            position: "absolute",
            height:
              CBLOCK_BOTTOM_OF_SVG +
              (numberOfInternalElements - 1) * CBLOCK_HEIGHT_OF_EXTRA_INTERNAL_BLOCK,
          }}
          d={`m 4 8 a 4 4 0 0 1 4 -4 h 8 c 2 0 3 1 4 2 l 4 4 c 1 1 2 2 4 2 h 12 c 2 0 3 -1 4 -2 l 4 -4 c 1 -1 2 -2 4 -2 h ${
            textWidth - 40
          } a 4 4 0 0 1 4 4 v 32 a 4 4 0 0 1 -4 4 h -${
            textWidth - 40 - 16
          } c -2 0 -3 1 -4 2 l -4 4 c -1 1 -2 2 -4 2 h -12 c -2 0 -3 -1 -4 -2 l -4 -4 c -1 -1 -2 -2 -4 -2 h -8 a 4 4 0 0 0 -4 4 v ${
            40 + Math.max(numberOfInternalElements - 1, 0) * CBLOCK_HEIGHT_OF_EXTRA_INTERNAL_BLOCK
          } a 4 4 0 0 0 4 4 h 8 c 2 0 3 1 4 2 l 4 4 c 1 1 2 2 4 2 h 12 c 2 0 3 -1 4 -2 l 4 -4 c 1 -1 2 -2 4 -2 h ${
            textWidth - 40 - 16
          } h 0 a 4 4 0 0 1 4 4 v 32 a 4 4 0 0 1 -4 4 h -${
            textWidth - 40
          } c -2 0 -3 1 -4 2 l -4 4 c -1 1 -2 2 -4 2 h -12 c -2 0 -3 -1 -4 -2 l -4 -4 c -1 -1 -2 -2 -4 -2 h -8 a 4 4 0 0 1 -4 -4 z`}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          left: "4px",
          top: "12px",
          height: `${CBLOCK_BOTTOM_OF_DIVET2 - CBLOCK_BOTTOM_OF_DIVET1 - 8}px`,
        }}
        ref={blockRef}
      >
        <DroppableBlock
          id={id}
          status={status}
          type={type}
          internalDroppable={true}
          allMovingIds={allMovingIds}
          allBlocks={allBlocks}
        >
          <p ref={textRef} id={`label-${id}`}>
            {blockTypeInformation[type].label}
          </p>
        </DroppableBlock>
      </div>
      <div
        style={{
          position: "absolute",
          left: "4px",
          top:
            CBLOCK_TOP_OF_BLOCK2 +
            Math.max(numberOfInternalElements - 1, 0) * CBLOCK_HEIGHT_OF_EXTRA_INTERNAL_BLOCK +
            6,
          height: `${CBLOCK_BOTTOM_OF_BLOCK2 - CBLOCK_TOP_OF_BLOCK2 - 8}px`,
        }}
      >
        <DroppableBlock
          id={id}
          status={status}
          type={type}
          allMovingIds={allMovingIds}
          internalDroppable={false}
          allBlocks={allBlocks}
        >
          <p
            style={{
              visibility: "hidden",
            }}
          >
            {blockTypeInformation[type].label}
          </p>
        </DroppableBlock>
      </div>
    </>
  );
};
