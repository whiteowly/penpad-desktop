import React, { useState } from "react";
import "./Journal.css";
import Sidebar from "./sidebar";

export default function ToDoList() {
  return (
   <div>
      <Sidebar />
      <div style={{ marginLeft: "60px", padding: "20px" }}>
        <h1>To Do List</h1>
        
      </div>
    </div>
  );
}