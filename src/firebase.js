// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAaTaGHJVq9ouy-9TbkeJ7xQ-f5GCh6u4g",
  authDomain: "penpad-d7362.firebaseapp.com",
  projectId: "penpad-d7362",
  storageBucket: "penpad-d7362.firebasestorage.app",
  messagingSenderId: "923363544696",
  appId: "1:923363544696:web:67be1c4492978abc9da78d",
  measurementId: "G-F8NCWJ07TT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);