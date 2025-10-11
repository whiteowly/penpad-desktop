import React, { useState } from "react";
import "./Journal.css";
import Sidebar from "./sidebar";

export default function CreateYourList() {
  return (
    <div>
      <Sidebar />
      <div style={{ marginLeft: "60px", padding: "20px" }}>
        <h1>Create your List</h1>
     
      </div>
    </div>
  );
}