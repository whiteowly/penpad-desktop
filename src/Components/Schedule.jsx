import React, { useState } from "react";
import "./Journal.css";
import Sidebar from "./sidebar";

export default function Schedule() {
  return (
    <div>
      <Sidebar />
      <div style={{ marginLeft: "60px", padding: "20px" }}>
        <h1>Journal</h1>
        <p>This is your journal page content...</p>
      </div>
    </div>
  );
}