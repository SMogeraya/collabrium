import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace with your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCozy9CpatA-cuv9Pq4W2fZ5xQXNZVMrds",
  authDomain: "sahana-new-project.firebaseapp.com",
  projectId: "sahana-new-project",
  storageBucket: "sahana-new-project.firebasestorage.app",
  messagingSenderId: "390879122862",
  appId: "1:390879122862:web:76223b5e198f4cc704243f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
