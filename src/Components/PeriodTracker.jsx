import React, { useState, useEffect } from "react";
import "./Journal.css";
import Sidebar from "./sidebar";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useAuth } from "../AuthContext";
import ErrorBoundary from "../ErrorBoundary";

function PeriodTracker() {
  const [lastPeriodDate, setLastPeriodDate] = useState("");
  const [cycleLength, setCycleLength] = useState(28); // Default cycle length is 28 days
  const [predictedDate, setPredictedDate] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      console.log("User ID:", user.uid); // Log the user ID
      const fetchUserData = async () => {
        try {
          const userDocRef = doc(db, "users", user.uid);
          console.log("Fetching document at path:", `users/${user.uid}`);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            console.log("Document data:", userDoc.data());
            const data = userDoc.data();
            setLastPeriodDate(data.lastPeriodDate);
            setCycleLength(data.cycleLength);
            if (data.lastPeriodDate && data.cycleLength) {
              const lastDate = new Date(data.lastPeriodDate);
              const nextDate = new Date(lastDate);
              nextDate.setDate(lastDate.getDate() + parseInt(data.cycleLength));
              setPredictedDate(nextDate.toLocaleDateString());
            }
          } else {
            console.log("No document found for user ID:", user.uid);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };
      fetchUserData();
    }
  }, [user]);

  const saveUserData = async () => {
    if (!user) {
      alert("Please log in to save your data.");
      return;
    }

    const userDocRef = doc(db, "users", user.uid);
    await setDoc(userDocRef, {
      lastPeriodDate,
      cycleLength,
    });
    alert("Your data has been saved.");
  };

  const calculateNextPeriod = () => {
    if (!lastPeriodDate || !cycleLength) {
      alert("Please enter all details.");
      return;
    }

    const lastDate = new Date(lastPeriodDate);
    const nextDate = new Date(lastDate);
    nextDate.setDate(lastDate.getDate() + parseInt(cycleLength));
    setPredictedDate(nextDate.toLocaleDateString());
    saveUserData();
  };

  return (
    <div>
      <Sidebar />
      <div style={{ marginLeft: "60px", padding: "20px" }}>
        <h1>Period Tracker</h1>
        <div className="form">
          <label>
            Last Period Date:
            <input
              type="date"
              value={lastPeriodDate}
              onChange={(e) => setLastPeriodDate(e.target.value)}
            />
          </label>
          <label>
            Average Cycle Length (days):
            <input
              type="number"
              value={cycleLength}
              onChange={(e) => setCycleLength(e.target.value)}
            />
          </label>
          <button onClick={calculateNextPeriod}>Predict Next Period</button>
        </div>
        {predictedDate && (
          <div className="prediction">
            <h2>Predicted Next Period Date:</h2>
            <p>{predictedDate}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Wrap PeriodTracker in ErrorBoundary
export default function PeriodTrackerWithBoundary() {
  return (
    <ErrorBoundary>
      <PeriodTracker />
    </ErrorBoundary>
  );
}