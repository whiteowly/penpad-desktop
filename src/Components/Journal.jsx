import React, { useState } from "react";
import "./Journal.css";
import Sidebar from "./sidebar";


export default function Journal() {
  
  const[ entries, setEntries] = useState([]);
  const[title, setTitle] = useState("");
  const[content, setContent] = useState("");
  
  const handleAddEntry = () => {
    if (title.trim() && content.trim()){
      const newEntry = {
        id: Date.now(),
        title,
        content, 
        date: new Date().toLocaleDateString(),
      };
      setEntries([newEntry, ...entries]);
      setTitle("");
      setContent("");
    }
  };
  return (
   <div className="layoutContainer">
      <Sidebar />
      <div className="main-content">
    <div className="top-bar">
    <img 
      src="/Users.jpg" 
      alt="User Settings" 
      className="UsersIcon" 
      onClick={() => console.log('Open settings')}
    />
    </div>
   <h1>Jouranl</h1>
   <div className="Form">
    <input type='text' placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)}/>
    <textarea type="text" placeholder="MainContent" value={content} onChange={(e) => SVGTextContentElement(e.target.value)}/>
    <button onClick={handleAddEntry}>Hit it!</button>
   </div>
<div className="Entries">
  {entries.length === 0 ? ( <p>Place is empty, why dont you add some!</p>): 
  (entries.map((entry)=>(
    <div key={entry.id} className="JournalEntry">
      <h3>{entry.title}</h3>
      <small>{entry.date}</small>
      <p>{entry.content}</p>
      </div>
  )))}
</div>
      </div>
      
    </div>
  );
}
