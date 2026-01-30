import React, { useEffect, useState } from "react";
import "./CreateYourList.css";
import { useAuth } from "../AuthContext";
import { db } from "../firebase";
import { doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";

export default function CreateYourList() {
  const { user } = useAuth();
  const [lists, setLists] = useState(() => {
    try {
      const saved = localStorage.getItem("penpad_custom_lists");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [newListTitle, setNewListTitle] = useState("");
  const [dbInitialized, setDbInitialized] = useState(false);

  // Sync with Firestore
  useEffect(() => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);

    (async () => {
      try {
        const snap = await getDoc(userRef);
        const dbLists = snap.exists() ? snap.data().customLists || [] : [];
        const local = JSON.parse(localStorage.getItem("penpad_custom_lists") || "[]");
        if (dbLists.length === 0 && local.length > 0) {
          await setDoc(userRef, { customLists: local }, { merge: true });
        }
      } catch (e) {
        console.debug("CreateYourList: getDoc error", e);
      }
    })();

    let initial = true;
    const unsub = onSnapshot(userRef, (snap) => {
      if (!snap.exists()) {
        const local = JSON.parse(localStorage.getItem("penpad_custom_lists") || "[]");
        if (initial && local.length > 0) {
          setDoc(userRef, { customLists: local }, { merge: true }).catch((err) => console.error(err));
        }
        initial = false;
        setDbInitialized(true);
        return;
      }

      const dbLists = snap.data().customLists || [];
      setLists(dbLists.map(l => ({ ...l, newItemText: "" })));
      localStorage.setItem("penpad_custom_lists", JSON.stringify(dbLists));
      initial = false;
      setDbInitialized(true);
    });

    return () => unsub();
  }, [user]);

  // Persist to Firestore
  useEffect(() => {
    const cleanedLists = lists.map(({ newItemText, ...rest }) => rest);
    localStorage.setItem("penpad_custom_lists", JSON.stringify(cleanedLists));
    if (!user || !dbInitialized) return;
    const userRef = doc(db, "users", user.uid);
    setDoc(userRef, { customLists: cleanedLists }, { merge: true }).catch(() => { });
  }, [lists, user, dbInitialized]);

  const addList = (e) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;
    const newList = {
      id: Date.now(),
      title: newListTitle.trim(),
      items: [],
      newItemText: "",
    };
    setLists([...lists, newList]);
    setNewListTitle("");
  };

  const deleteList = (id) => {
    if (window.confirm("Are you sure you want to delete this entire list?")) {
      setLists(lists.filter((l) => l.id !== id));
    }
  };

  const addItem = (listId, text) => {
    if (!text || !text.trim()) return;
    setLists(
      lists.map((l) => {
        if (l.id === listId) {
          return {
            ...l,
            items: [...l.items, { id: Date.now(), text: text.trim(), completed: false }],
            newItemText: "",
          };
        }
        return l;
      })
    );
  };

  const toggleItem = (listId, itemId) => {
    setLists(
      lists.map((l) => {
        if (l.id === listId) {
          return {
            ...l,
            items: l.items.map((i) => (i.id === itemId ? { ...i, completed: !i.completed } : i)),
          };
        }
        return l;
      })
    );
  };

  const deleteItem = (listId, itemId) => {
    setLists(
      lists.map((l) => {
        if (l.id === listId) {
          return {
            ...l,
            items: l.items.filter((i) => i.id !== itemId),
          };
        }
        return l;
      })
    );
  };

  const updateNewItemText = (listId, text) => {
    setLists(
      lists.map((l) => (l.id === listId ? { ...l, newItemText: text } : l))
    );
  };

  return (
    <div className="custom-lists-page">

      <div className="custom-lists-content">
        <h1>Custom Lists</h1>

        <form onSubmit={addList} className="new-list-form">
          <input
            type="text"
            placeholder="Create a new list (e.g. Shopping List)..."
            value={newListTitle}
            onChange={(e) => setNewListTitle(e.target.value)}
          />
          <button type="submit">Create List</button>
        </form>

        <div className="lists-grid">
          {lists.length === 0 && <p className="empty-msg">No lists created yet. Create one above!</p>}
          {lists.map((list) => (
            <div key={list.id} className="list-card">
              <div className="list-card-header">
                <h2>{list.title}</h2>
                <button className="delete-list-btn" onClick={() => deleteList(list.id)}>×</button>
              </div>

              <div className="item-input-row">
                <input
                  type="text"
                  placeholder="Add item..."
                  value={list.newItemText || ""}
                  onChange={(e) => updateNewItemText(list.id, e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addItem(list.id, list.newItemText)}
                />
                <button onClick={() => addItem(list.id, list.newItemText)}>+</button>
              </div>

              <ul className="checklist">
                {list.items.map((item) => (
                  <li key={item.id} className={item.completed ? "completed" : ""}>
                    <label>
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => toggleItem(list.id, item.id)}
                      />
                      <span>{item.text}</span>
                    </label>
                    <button className="remove-item-btn" onClick={() => deleteItem(list.id, item.id)}>×</button>
                  </li>
                ))}
                {list.items.length === 0 && <li className="empty-items">No items yet.</li>}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
