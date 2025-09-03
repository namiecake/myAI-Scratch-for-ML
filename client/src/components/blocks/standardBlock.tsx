import { Block, Blocks, blockTypeInformation } from "@/types/block";
import { blockCategoryToColor } from "@/types/blockCategory";
import {
  STANDARD_BOTTOM_OF_BLOCK,
  STANDARD_BOTTOM_OF_SVG,
  STANDARD_TOP_OF_DIVET,
} from "@/types/blockStyling";
import { UniqueIdentifier } from "@dnd-kit/core/dist/types";
import { DroppableBlock } from "./droppableBlock";
import { useEffect, useRef, useState } from "react";

export const StandardBlock: React.FC<
  Block & {
    allMovingIds?: UniqueIdentifier[];
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
          width: `${blockWidth + 8}px`,
          height: STANDARD_BOTTOM_OF_SVG,
        }}
      >
        <path
          fill={blockCategoryToColor[blockTypeInformation[type].category].background}
          stroke={blockCategoryToColor[blockTypeInformation[type].category].border}
          style={{
            position: "absolute",
            height: STANDARD_BOTTOM_OF_SVG,
          }}
          d={`m 4 8 A 4 4 0 0 1 8 4 H 16 c 2 0 3 1 4 2 l 4 4 c 1 1 2 2 4 2 h 12 c 2 0 3 -1 4 -2 l 4 -4 c 1 -1 2 -2 4 -2 h ${
            textWidth - 40
          } a 4 4 0 0 1 4 4 v 40 a 4 4 0 0 1 -4 4 h -${
            textWidth - 40
          } c -2 0 -3 1 -4 2 l -4 4 c -1 1 -2 2 -4 2 h -12 c -2 0 -3 -1 -4 -2 l -4 -4 c -1 -1 -2 -2 -4 -2 H 8 a 4 4 0 0 1 -4 -4 z`}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          left: "4px",
          top: "12px",
          height: `${STANDARD_BOTTOM_OF_BLOCK - STANDARD_TOP_OF_DIVET}px`,
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
