import { auth } from "@/lib/firebase"; // Import Firestore from your config
import BaseService from "./BaseService";

export default class DatabaseService extends BaseService {
  static saveChallengeDataRoute = "database/user-complete-challenge";
  static retrieveUserDataRoute = "database/user-data";

  public static saveUserChallengeData = async (challengeId: string) => {
    try {
      if (!auth.currentUser) {
        throw new Error("User is not logged in");
      }
      const data = {
        user_id: auth.currentUser.uid,
        challenge_id_completed: challengeId,
      };

      return await this.post(this.saveChallengeDataRoute, data);
    } catch (error) {
      console.error("Error saving user data:", error);
    }
  };

  public static retrieveUserData = async () => {
    try {
      if (!auth.currentUser) {
        throw new Error("User is not logged in");
      }
      return await this.get(this.retrieveUserDataRoute);
    } catch (error) {
      console.error("Error retrieving user data:", error);
    }
  };
}
