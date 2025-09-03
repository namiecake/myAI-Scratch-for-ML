import { auth } from "@/lib/firebase";
import BaseService, { API_BASE_URL } from "./BaseService";
import { v4 as uuidv4 } from 'uuid';

export default class DiagramService extends BaseService {
  static processDiagramRoute = "playground/process-diagram";
  static cancelTrainingRoute = "playground/cancel-job";
  // static processDiagramRoute = "train";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static async processDiagram(data: any): Promise<any> {
    // get user id from local storage
    // const auth_id = localStorage.getItem("user_id");

    const user_id = auth.currentUser?.uid;

    if (user_id) {
      data = {
        ...data,
        user_id: user_id,
        job_id: uuidv4(),
      };
      console.log("data being posted", data);
      return await this.post(this.processDiagramRoute, data);
    }
    return;
  }

  public static async cancelTraining(): Promise<void> {
    const user_id = auth.currentUser?.uid;
    return await this.post(this.cancelTrainingRoute, { user_id });
  }
}

const wsocket: WebSocket = new WebSocket(`wss://${API_BASE_URL}/updates-ws`);
wsocket.onmessage = (event: MessageEvent): void => {
  console.log("Message received:", event.data);
};
