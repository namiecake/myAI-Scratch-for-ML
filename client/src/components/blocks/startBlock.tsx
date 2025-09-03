import { Block, Blocks, blockTypeInformation } from "@/types/block";
import { blockCategoryToColor } from "@/types/blockCategory";
import {
  STARTBLOCK_BOTTOM_OF_SVG,
  STARTBLOCK_TOP_OF_BLOCK,
  STARTBLOCK_BOTTOM_OF_BLOCK,
} from "@/types/blockStyling";
import { UniqueIdentifier } from "@dnd-kit/core/dist/types";
import { DroppableBlock } from "./droppableBlock";
import { useEffect, useRef, useState } from "react";

export const StartBlock: React.FC<
  Block & {
    allMovingIds?: UniqueIdentifier[];
    droppedBlocks?: Blocks;
    allBlocks: Blocks;
  }
> = ({ id, type, status, allMovingIds, allBlocks }) => {
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

  return (
    <>
      <svg
        style={{
          width: `${blockWidth + 16}px`,
          height: `${STARTBLOCK_BOTTOM_OF_SVG}px`,
        }}
      >
        <path
          fill={blockCategoryToColor[blockTypeInformation[type].category].background}
          stroke={blockCategoryToColor[blockTypeInformation[type].category].border}
          style={{
            position: "absolute",
            height: `${STARTBLOCK_BOTTOM_OF_SVG}px`,
          }}
          d={`m 4 25 a 4 4 0 0 1 4 -4 H 16 c 21 -22 67 -22 92 0 h ${
            textWidth - 92
          } a 4 4 0 0 1 4 4 v 40 a 4 4 0 0 1 -4 4 h -${
            textWidth + 56 - 92
          } c -2 0 -3 1 -4 2 l -4 4 c -1 1 -2 2 -4 2 h -12 c -2 0 -3 -1 -4 -2 l -4 -4 c -1 -1 -2 -2 -4 -2 H 8 a 4 4 0 0 1 -4 -4 z`}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          left: "4px",
          top: `${STARTBLOCK_TOP_OF_BLOCK}px`,
          height: `${STARTBLOCK_BOTTOM_OF_BLOCK - STARTBLOCK_TOP_OF_BLOCK}px`,
        }}
        ref={blockRef}
      >
        <DroppableBlock
          id={id}
          status={status}
          type={type}
          allMovingIds={allMovingIds}
          allBlocks={allBlocks}
          internalDroppable={false}
        >
          <p ref={textRef} id={`label-${id}`}>
            {blockTypeInformation[type].label}
          </p>
        </DroppableBlock>
      </div>
    </>
  );
};
