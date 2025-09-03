import React from "react";
import "../playground.css";
import DiagramService from "@/services/Diagram";
import { DiagramType } from "@/types/diagram";
import { Blocks } from "@/types/block";
import { buildDiagram } from "@/utils/blockapiSchema";
import { EvaluateStatus, TrainingStatus } from "@/types/training";
import { useNotifications } from "@/contexts/NotificationContext";
import { checkForTrainErrors } from "@/utils/trainErrors";
import { checkForEvalErrors } from "@/utils/evalErrors";
import DatabaseService from "@/services/Database";
import { useUser } from "@/contexts/UserContext";
import { InfoButton } from "@/components/InfoButton";

interface ControlsProps {
  droppedBlocks: Blocks;
  trainingStatus: TrainingStatus;
  challengeId: string;
  updateTrainingStatus: (newStatus: TrainingStatus) => void;
  updateEvaluateStatus: (newStatus: EvaluateStatus) => void;
}

export const Controls: React.FC<ControlsProps> = ({
  droppedBlocks,
  updateTrainingStatus,
  trainingStatus,
  updateEvaluateStatus,
  challengeId,
}) => {
  const blockData: DiagramType = buildDiagram(droppedBlocks, challengeId);
  const { addNotification } = useNotifications();

  const { updateUserData } = useUser();


  const beginTraining = async (data: DiagramType) => {
    // Hide evaluation results
    updateEvaluateStatus("empty");
    // Frontend checks on validity of diagram
    const trainResult = checkForTrainErrors(data, droppedBlocks);
    if (trainResult.error) {
      updateTrainingStatus("error");
      if (trainResult.errorMessage) {
        addNotification({
          type: "error",
          message: trainResult.errorMessage,
        });
      }
      return;
    }

    updateTrainingStatus("loading");
    // post request to start training
    DiagramService.processDiagram(data).then((response) => {
      console.log(response);
    });
  };

  const cancelTraining = async () => {
    DiagramService.cancelTraining().then((response) => {
      console.log(response);
    });
    updateTrainingStatus("result");
  };
  const beginEval = async (droppedBlocks: Blocks) => {
    updateEvaluateStatus("empty");
    const evalResult = checkForEvalErrors(droppedBlocks);
    if (evalResult.error) {
      updateEvaluateStatus("error");
      if (evalResult.errorMessage) {
        addNotification({
          type: "error",
          message: evalResult.errorMessage,
        });
      }
      return; // Indicate failure
    }
    updateEvaluateStatus("show");
    // Upload to Firestore that the user completed the challenge
    DatabaseService.saveUserChallengeData(challengeId).then((response) => {
      console.log(response);
      DatabaseService.retrieveUserData().then((response) => {
        updateUserData(response);
      });
    });
  };

  return (
    <div className="controls">
      <div className="button-container">
        <button
          className="control-button start-button"
          onClick={() => beginTraining(blockData)}
          disabled={trainingStatus === "training" || trainingStatus === "loading"}
        >
          Train
        </button>
        <button
          onClick={() => beginEval(droppedBlocks)}
          className="control-button eval-button"
          disabled={trainingStatus !== "result"}
        >
          Evaluate
        </button>
        <button
          onClick={() => {
            cancelTraining();
          }}
          className="control-button cancel-button"
          disabled={trainingStatus != "training"}
        >
          Cancel
        </button>  
        <InfoButton 
          content={
            <div>
              <p>Click <strong>Train</strong> to start teaching your model with the blocks you've connected. In ordered to be able to Train your model your must first create a model make sure to start with the purple 'train' block.</p>
              <br></br>
              <p>Once training is complete, click <strong>Evaluate</strong> to see how well your model performs at making predictions on new examples it hasn't seen before. First train the model and defined the evaluation information you want to see starting with the purple 'evaluate' block and then adding the red blocks as desired.</p>
            </div>
          }
        />
      </div>
    </div>
  );
};
