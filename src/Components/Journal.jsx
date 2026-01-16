import React, { useState } from "react";
import "./Journal.css";
import Sidebar from "./sidebar";
import { auth, db } from "../firebase";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import ReactModal from "react-modal";

export default function Journal() {
  const [entries, setEntries] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [user, setUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const fetchEntries = async () => {
          try {
            const q = query(
              collection(db, "journalEntries"),
              where("userId", "==", currentUser.uid)
            );
            const querySnapshot = await getDocs(q);
            const fetchedEntries = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setEntries(fetchedEntries);
          } catch (error) {
            console.error("Error fetching entries:", error);
          }
        };
        fetchEntries();
      } else {
        setEntries([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleAddEntry = async () => {
    if (!user) {
      alert("Please log in to add an entry.");
      return;
    }

    if (title.trim() && content.trim()) {
      try {
        const newEntry = {
          title,
          content,
          date: new Date().toLocaleString(), // Updated to include time
          userId: user.uid,
        };
        console.log("Attempting to add entry to Firestore:", newEntry);
        const docRef = await addDoc(collection(db, "journalEntries"), newEntry);
        console.log("Entry successfully added with ID:", docRef.id);
        setEntries([{ id: docRef.id, ...newEntry }, ...entries]);
        setTitle("");
        setContent("");
      } catch (error) {
        console.error("Error adding entry to Firestore:", error);
        if (error.code === "permission-denied") {
          console.error("Permission denied. Check Firestore rules.");
          alert("Permission denied. Please check your Firestore Security Rules.");
        } else {
          console.error("Unexpected error:", error.message);
        }
      }
    } else {
      console.warn("Title or content is empty. Entry not added.");
    }
  };

  const openModal = (entry) => {
    setSelectedEntry(entry);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedEntry(null);
    setIsModalOpen(false);
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
            onClick={() => console.log("Open settings")}
          />
        </div>
        <h1>Journal</h1>
        <div className="Form">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            type="text"
            placeholder="MainContent"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <button
            onClick={() => {
              console.log("Button clicked");
              handleAddEntry();
            }}
          >
            Hit it!
          </button>
        </div>
        <div className="Entries">
          {entries.length === 0 ? (
            <p>Place is empty, why dont you add some!</p>
          ) : (
            entries.map((entry) => (
              <div
                key={entry.id}
                className="JournalEntry"
                onClick={() => openModal(entry)}
              >
                <h3>{entry.title}</h3>
                <small>{entry.date}</small>
                <p>{entry.content}</p>
              </div>
            ))
          )}
        </div>
        <ReactModal
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          contentLabel="Entry Details"
        >
          {selectedEntry && (
            <div>
              <h2>{selectedEntry.title}</h2>
              <small>{selectedEntry.date}</small>
              <p>{selectedEntry.content}</p>
              <button onClick={closeModal}>Close</button>
            </div>
          )}
        </ReactModal>
      </div>
    </div>
  );
}
