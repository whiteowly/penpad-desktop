import React, { useState } from "react";
import "./Journal.css";
import Sidebar from "./sidebar";

export default function BudgetTracker() {
  return (
    <div>
      <Sidebar />
      <div style={{ marginLeft: "60px", padding: "20px" }}>
        <h1>Budget Tracker</h1>
        <p></p>
      </div>
    </div>
  );
}