// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBR7-7srafs8bUZwZFRY1VRPhkMRUBd8jY",
  authDomain: "penpad-463c9.firebaseapp.com",
  projectId: "penpad-463c9",
  storageBucket: "penpad-463c9.firebasestorage.app",
  messagingSenderId: "484768151659",
  appId: "1:484768151659:web:f557c1a57a9f01e0d9592e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);