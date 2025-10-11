import React, { useState } from "react";
import "./Journal.css";
import Sidebar from "./sidebar";

export default function Reminders() {
  return (
    <div>
      <Sidebar />
      <div style={{ marginLeft: "60px", padding: "20px" }}>
        <h1>Reminder</h1>
        
      </div>
    </div>
  );
}