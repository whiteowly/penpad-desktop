import React, { useState, useEffect } from "react";
import "./Journal.css";
import { auth, db } from "../firebase";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import ReactModal from "react-modal";
import { Plus, X } from "lucide-react";

ReactModal.setAppElement("#root");

export default function Journal() {
  const [entries, setEntries] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [user, setUser] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);

  useEffect(() => {
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
            })).sort((a, b) => new Date(b.date) - new Date(a.date));
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
        const now = new Date();
        const newEntry = {
          title,
          content,
          date: now.toLocaleString(),
          userId: user.uid,
        };
        const docRef = await addDoc(collection(db, "journalEntries"), newEntry);
        setEntries([{ id: docRef.id, ...newEntry }, ...entries]);
        setTitle("");
        setContent("");
        setIsAddModalOpen(false);
      } catch (error) {
        console.error("Error adding entry:", error);
      }
    }
  };

  const openViewModal = (entry) => {
    setSelectedEntry(entry);
    setIsViewModalOpen(true);
  };

  return (
    <div className="journal-page">
      <div className="journal-content">
        <header className="journal-header">
          <h1>My Journal</h1>
        </header>

        <div className="journal-grid">
          {entries.length === 0 ? (
            <div className="empty-state">
              <p>Your journal is empty. What's on your mind today?</p>
            </div>
          ) : (
            entries.map((entry) => (
              <div
                key={entry.id}
                className="entry-card"
                onClick={() => openViewModal(entry)}
              >
                <div className="card-header">
                  <h3>{entry.title || "Untitled"}</h3>
                  <span className="entry-time">
                    {entry.date && typeof entry.date === "string" && entry.date.includes(",")
                      ? entry.date.split(",")[1]
                      : ""}
                  </span>
                </div>
                <span className="entry-date">
                  {entry.date && typeof entry.date === "string"
                    ? entry.date.split(",")[0]
                    : "No Date"}
                </span>
                <p className="entry-preview">
                  {entry.content && entry.content.length > 50
                    ? entry.content.substring(0, 50) + "..."
                    : entry.content || "Empty content"}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Floating Action Button */}
        <button className="fab" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={28} />
        </button>

        {/* Add Entry Modal */}
        <ReactModal
          isOpen={isAddModalOpen}
          onRequestClose={() => setIsAddModalOpen(false)}
          className="journal-modal"
          overlayClassName="journal-overlay"
        >
          <div className="modal-header">
            <h2>New Journal Entry</h2>
            <button className="close-btn" onClick={() => setIsAddModalOpen(false)}>
              <X size={24} />
            </button>
          </div>
          <div className="modal-body">
            <input
              type="text"
              placeholder="Give your entry a title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              placeholder="What's happening?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <button className="save-btn" onClick={handleAddEntry}>
              Save Thought
            </button>
          </div>
        </ReactModal>

        {/* View Entry Modal */}
        <ReactModal
          isOpen={isViewModalOpen}
          onRequestClose={() => setIsViewModalOpen(false)}
          className="journal-modal view-modal"
          overlayClassName="journal-overlay"
        >
          {selectedEntry && (
            <>
              <div className="modal-header">
                <div>
                  <h2>{selectedEntry.title}</h2>
                  <small className="full-date">{selectedEntry.date}</small>
                </div>
                <button className="close-btn" onClick={() => setIsViewModalOpen(false)}>
                  <X size={24} />
                </button>
              </div>
              <div className="modal-body">
                <p className="full-content">{selectedEntry.content}</p>
              </div>
            </>
          )}
        </ReactModal>
      </div>
    </div>
  );
}
