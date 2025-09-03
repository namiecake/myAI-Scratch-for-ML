"use client";

import React, { useState, useEffect } from "react";
import {
  DndContext,
  DragStartEvent,
  DragEndEvent,
  DragMoveEvent,
  UniqueIdentifier,
} from "@dnd-kit/core";
import DiagramService from "@/services/Diagram";
import { Block, Blocks, BlockType, blockTypeInformation, MovingStack } from "../../types/block";
import { DroppableArea } from "./sandbox/droppableArea";
import { addBlock } from "../../utils/blockFunctions";
import { Coordinates } from "@dnd-kit/core/dist/types";
import "./playground.css";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import { dragMoveHandler, dragStartHandler, dragEndHandler } from "@/utils/playgroundFunctions";
import { DatasetView } from "./leftPanel/datasetView";
import { InstructionsView } from "./leftPanel/instructionsView";
import { NotificationStack, WebsocketNotification } from "../../components/notifications";
import { RightPanel } from "./rightPanel/RightPanel";
import { LeftPanel } from "./leftPanel/LeftPanel";
import PlaygroundHeader from "./header/PlaygroundHeader";
import { SolutionsView } from "./leftPanel/SolutionsView";
import { useUser } from "@/contexts/UserContext";
import { useNotifications } from "@/contexts/NotificationContext";

export const Playground: React.FC<{
  challengeId: string;
}> = ({ challengeId }) => {
  const [blocks, setBlocks] = useState<Blocks>({});
  const [blockIdCounter, setBlockIdCounter] = useState<number>(1);

  const [allMovingExternalIds, setAllMovingExternalIds] = useState<UniqueIdentifier[]>([]);
  const [movingStackCoords, setMovingStackCoords] = useState<MovingStack>({}); // relative coords of objects in stack
  const [movingStackHeadId, setMovingStackHeadId] = useState<UniqueIdentifier | undefined>();
  const [movingStackHeadCoords, setMovingStackHeadCoords] = useState<Coordinates>({ x: 0, y: 0 });

  const [activeTab, setActiveTab] = useState<"code" | "dataset" | "instructions" | "solutions">(
    "instructions"
  );
  const { userData } = useUser();
  const { addNotification } = useNotifications();

  useEffect(() => {
    let idCounter = 1;
    let blocks: Blocks = {};
    Object.entries(blockTypeInformation).forEach(([key]) => {
      const newBlock: Block = {
        id: idCounter,
        type: key as BlockType,
        status: "available",
      };
      blocks = addBlock(blocks, newBlock);
      idCounter += 1;
    });
    setBlockIdCounter(idCounter);
    setBlocks(blocks);

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      DiagramService.cancelTraining().then((response) => {
        console.log(response);
      });
      event.preventDefault();
      return '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // CALLED WHEN DRAGGING MOTION BEGINS
  const handleDragStart = (event: DragStartEvent) => {
    const { movingStack, movingStackHeadId, movingStackHeadCoordinates } = dragStartHandler(
      blocks,
      event
    );
    setMovingStackCoords(movingStack);
    setMovingStackHeadId(movingStackHeadId);
    setMovingStackHeadCoords(movingStackHeadCoordinates);
  };

  // CALLED WHEN DRAG MOTION ENDS / BLOCK IS DROPPED
  const handleDragEnd = (event: DragEndEvent) => {
    const dragEnd = dragEndHandler(
      blocks,
      event,
      blockIdCounter,
      movingStackCoords,
      allMovingExternalIds,
      addNotification
    );
    if (dragEnd) {
      const { newBlocks, idCounter } = dragEnd;
      setBlocks(newBlocks);
      setBlockIdCounter(idCounter);
    }
    setMovingStackCoords({});
    setMovingStackHeadId(undefined);
    setMovingStackHeadCoords({ x: 0, y: 0 });
    setAllMovingExternalIds([]);
  };

  // CALLED WHEN DRAGGING BLOCK (thousands of times per second)
  const handleDragMove = (event: DragMoveEvent) => {
    setMovingStackHeadCoords(dragMoveHandler(event));

    // If block is dragged from left panel, set transform to 0 to maintain position and let drag overlay move instead
    const dragging = document.getElementById(event.active.id.toString());
    if (dragging && blocks[event.active.id].status === "available") {
      dragging.style.transform = `translate3d(0px, 0px, 0)`;
    }
  };

  const droppedBlocks: Blocks = Object.fromEntries(
    Object.entries(blocks).filter(([, block]) => block.status === "dropped")
  );

  const renderMainContent = () => {
    switch (activeTab) {
      case "code":
        return (
          <>
            <LeftPanel
              blocks={blocks}
              movingStackHeadId={movingStackHeadId}
              droppedBlocks={droppedBlocks}
            />
            <div className="block-sandbox-wrapper">
              <div className="block-sandbox">
                <DroppableArea
                  droppedBlocks={droppedBlocks}
                  allBlocks={blocks}
                  movingStackHeadId={movingStackHeadId}
                  movingStackHeadCoords={movingStackHeadCoords}
                  movingStackCoords={movingStackCoords}
                />
              </div>
            </div>
          </>
        );
      case "dataset":
        return <DatasetView challengeId={challengeId} />;
      case "instructions":
        return <InstructionsView challengeId={challengeId} />;
      case "solutions":
        return <SolutionsView challengeId={challengeId} />;
      default:
        return null;
    }
  };

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragMove={handleDragMove}
      modifiers={[restrictToWindowEdges]}
      autoScroll={{
        layoutShiftCompensation: false,
        threshold: {
          x: 0,
          y: 0.2,
        },
        acceleration: 0,
      }}
    >
      <div className="playground-section-wrapper">
        <PlaygroundHeader />
        <div className="playground-section">
          {/* <ProfileButton /> */}
          <NotificationStack />
          <WebsocketNotification />
          <div className="main-content">
            <div className="tab-container">
              <div className="tabs-left">
                <button
                  className={`tab-button ${activeTab === "code" ? "active" : ""}`}
                  onClick={() => setActiveTab("code")}
                >
                  Code
                </button>
                <button
                  className={`tab-button ${activeTab === "dataset" ? "active" : ""}`}
                  onClick={() => setActiveTab("dataset")}
                >
                  Dataset
                </button>
                <button
                  className={`tab-button ${activeTab === "instructions" ? "active" : ""}`}
                  onClick={() => setActiveTab("instructions")}
                >
                  Instructions
                </button>
                <button
                  className={`tab-button ${activeTab === "solutions" ? "active" : ""}`}
                  onClick={() => setActiveTab("solutions")}
                  disabled={
                    !userData ||
                    !userData.user ||
                    !userData.user.challenge_information ||
                    !userData.user.challenge_information[challengeId] ||
                    !userData.user.challenge_information[challengeId].completed
                  }
                >
                  Solutions
                </button>
              </div>
            </div>
            <div className="panels-container">{renderMainContent()}</div>
          </div>
          <RightPanel droppedBlocks={droppedBlocks} challengeId={challengeId} />
        </div>
      </div>
    </DndContext>
  );
};
