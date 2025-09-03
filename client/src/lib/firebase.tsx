import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBSRxDSghJd7C5axea_acdPhL2LHT1v-WA",
  authDomain: "cs194-449021.firebaseapp.com",
  projectId: "cs194-449021",
  storageBucket: "cs194-449021.firebasestorage.app",
  messagingSenderId: "590321385188",
  appId: "1:590321385188:web:3b889a51dc1b71c80e76f1",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const getFirebaseToken = async () => {
  if (auth.currentUser) {
    return await auth.currentUser.getIdToken(); // Get Firebase ID Token
  }
  return null;
};

export { auth, db, setDoc, doc, getFirebaseToken };
