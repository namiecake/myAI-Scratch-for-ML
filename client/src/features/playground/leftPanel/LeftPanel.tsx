import React, { useState, useEffect } from "react";
import { DraggableBlock } from "@/components/blocks/draggableBlock";
import { Block, Blocks, blockTypeInformation } from "@/types/block";
import { BlockCategories, BlockCategory, blockCategoryToColor } from "@/types/blockCategory";
import "../playground.css";
import { InfoButton } from "@/components/InfoButton";
import { HelperSection } from "@/features/playground/leftPanel/helper";
import { DragOverlay, UniqueIdentifier } from "@dnd-kit/core";
import { StandardBlock } from "@/components/blocks/standardBlock";
import { StartBlock } from "@/components/blocks/startBlock";
import { CBlock } from "@/components/blocks/cBlock";
import { TrainingStatus } from "@/types/training";
import { useWebSocketContext } from "@/contexts/WebSocketContext";
import { Tooltip } from 'react-tooltip';

export const LeftPanel: React.FC<{
  blocks: Blocks;
  movingStackHeadId: UniqueIdentifier | undefined;
  droppedBlocks: Blocks;
}> = ({ blocks, movingStackHeadId, droppedBlocks }) => {
  const { messages } = useWebSocketContext();
  const [categorySelected, setCategorySelected] = useState<BlockCategory>("general");
  const [trainingStatus, setTrainingStatus] = useState<TrainingStatus>("empty");
  useEffect(() => {
    if (messages.length === 0) return;

    const latestMessage = messages[messages.length - 1];
    let parsedData;
    try {
      parsedData = typeof latestMessage === "string" ? JSON.parse(latestMessage) : latestMessage;
    } catch (error) {
      console.error("Error parsing websocket message:", error);
      parsedData = {};
    }

    if (parsedData.update_type == "progress") {
      if (trainingStatus !== "training") {
        setTrainingStatus("training");
      }
    } else if (parsedData.update_type == "result") {
      setTrainingStatus("result");
    } else if (parsedData.update_type == "error") {
      setTrainingStatus("error");
    }
  }, [messages]);

  const renderDraggableBlock = (block: Block) => {
    switch (blockTypeInformation[block.type].layout) {
      case "standard":
        return (
          <StandardBlock id={block.id} type={block.type} status={block.status} allBlocks={blocks} />
        );
      case "cBlock":
        return <CBlock id={block.id} type={block.type} status={block.status} allBlocks={blocks} />;
      case "startBlock":
        return (
          <StartBlock id={block.id} type={block.type} status={block.status} allBlocks={blocks} />
        );
    }
  };

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        width: "300px",
      }}
    >
      {/* Top Section - 65% */}
      <div className="block-store">
        {/* Categories */}
        <div className="category-container">
          {BlockCategories.map((category) => (
            <button
              key={category}
              onClick={() => setCategorySelected(category)}
              style={{
                backgroundColor:
                  category === categorySelected ? "var(--light-gray)" : "transparent",
              }}
            >
              <div
                className="category-circle"
                style={{
                  backgroundColor: blockCategoryToColor[category as BlockCategory].background,
                }}
              />
              {category[0].toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
        {/* Available Blocks */}
        <div className="available-block-wrapper">
          <div className="available-block-container">
            <div style={{ display: "flex", gap: "8px" }}>
              <p className="available-block-header">
                {categorySelected[0].toUpperCase() + categorySelected.slice(1)}
              </p>
              <InfoButton content="Build your model by dragging blocks from the left panel into the workspace when in the code tab. Click 'Train' when you're ready to test your model! Hover over each block to learn more. For more information on how to use the playground click the 'Instructions' tab." />
            </div>
            {Object.entries(blocks)
              .filter(
                ([, block]) =>
                  blockTypeInformation[block.type].category == categorySelected &&
                  block.status == "available"
              )
              .sort(([, a], [, b]) => {
                const order = { startBlock: 0, cBlock: 1, standard: 2 };
                // Compare by predefined order
                const orderComparison =
                  (order[blockTypeInformation[a.type].layout] || 3) -
                  (order[blockTypeInformation[b.type].layout] || 3);
                if (orderComparison !== 0) return orderComparison;
                // If same category, sort alphabetically by type
                return a.type.localeCompare(b.type);
              })
              .map(([, block]) => (
                <div key={block.id} data-tooltip-id="block-tooltip" data-tooltip-content={blockTypeInformation[block.type].description || blockTypeInformation[block.type].label}>
                 <DraggableBlock {...block} allBlocks={blocks} />
               </div>
             ))}
          </div>
        </div>
        <DragOverlay dropAnimation={null}>
          {movingStackHeadId && blocks[movingStackHeadId].status == "available" && (
            <div className="drag-overlay" id="drag-overlay">
              {renderDraggableBlock(blocks[movingStackHeadId])}
            </div>
          )}
        </DragOverlay>
        <Tooltip
         id="block-tooltip"
         place="right"
         delayShow={200}
         delayHide={100}
         className="tooltip"
       />
      </div>

      {/* Bottom Section - 35% */}
      <div className="helper-section">
        <HelperSection 
          droppedBlocks={droppedBlocks} 
          trainingStatus={trainingStatus} 
        />
      </div>
    </div>
  );
};
