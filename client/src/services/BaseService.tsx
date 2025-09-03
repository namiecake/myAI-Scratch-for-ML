import { getFirebaseToken } from "@/lib/firebase";
import axios from "axios";

// export const API_BASE_URL = "https://server-cloud-run-590321385188.us-west1.run.app"; // Change this as needed
export const API_BASE_URL = "https://client-server-590321385188.us-west1.run.app";
// export const API_BASE_URL = "http://127.0.0.1:8000";

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default abstract class BaseService {
  protected static async get<T>(endpoint: string): Promise<T> {
    try {
      const token = await getFirebaseToken(); // Get Firebase ID token
      if (!token) throw new Error("User not authenticated");

      const response = await axios.get<T>(`${API_BASE_URL}/${endpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Pass token to FastAPI in the Authorization header
          "Content-Type": "application/json",
        },
      });
      return response.data;

      // const response = await axios.get<T>(`${API_BASE_URL}/${endpoint}`, { params });
      // return response.data;
    } catch (error) {
      console.error("GET request error:", error);
      throw error;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected static async post<T>(endpoint: string, data: any): Promise<T> {
    try {
      const token = await getFirebaseToken(); // Get Firebase ID token
      if (!token) throw new Error("User not authenticated");

      const response = await axios.post<T>(`${API_BASE_URL}/${endpoint}`, data);
      return response.data;
    } catch (error) {
      console.error("POST request error:", error);
      throw error;
    }
  }
}
