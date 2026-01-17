import React, { useEffect, useState } from "react";
import "./ToDoList.css";
import Sidebar from "./sidebar";
import { useAuth } from "../AuthContext";
import { db } from "../firebase";
import { doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";

export default function ToDoList() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem("penpad_todos");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [input, setInput] = useState("");
  const [dbInitialized, setDbInitialized] = useState(false);

  // (localStorage is loaded synchronously into initial state)

  // Sync with Firestore for authenticated users
  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);

    // One-time merge: if DB empty but local has tasks, push local tasks to DB
    (async () => {
      try {
        const snap = await getDoc(userRef);
        const dbTasks = snap.exists() ? snap.data().todos || [] : [];
        const local = JSON.parse(localStorage.getItem("penpad_todos") || "[]");
        console.debug("ToDoList: getDoc fetched dbTasks.length=", dbTasks.length, "local.length=", local.length);
        if ((!dbTasks || dbTasks.length === 0) && local && local.length > 0) {
          await setDoc(userRef, { todos: local }, { merge: true });
        }
      } catch (e) {
        console.debug("ToDoList: getDoc error", e);
      }
    })();

    // realtime listener: update local tasks when DB changes
    let initial = true;
    const unsub = onSnapshot(userRef, (snap) => {
      const local = JSON.parse(localStorage.getItem("penpad_todos") || "[]");

      if (!snap.exists()) {
        // If DB doc missing on initial load but local has tasks, push local tasks to DB
        if (initial && local && local.length > 0) {
          setDoc(userRef, { todos: local }, { merge: true }).catch((err) => console.error(err));
        }
        initial = false;
        setDbInitialized(true);
        return;
      }

      const dbTasks = snap.data().todos || [];

      if (initial) {
        // If DB has no tasks but we have local tasks, prefer merging local -> DB
        if ((!dbTasks || dbTasks.length === 0) && local && local.length > 0) {
          setDoc(userRef, { todos: local }, { merge: true }).catch((err) => console.error(err));
          initial = false;
          setDbInitialized(true);
          return;
        }
      }

      console.debug("ToDoList: onSnapshot dbTasks.length=", dbTasks.length);
      setTasks(dbTasks);
      localStorage.setItem("penpad_todos", JSON.stringify(dbTasks));
      initial = false;
      setDbInitialized(true);
    });

    return () => unsub();
  }, [user]);

  // persist to localStorage and, if authenticated and DB initialized, to Firestore
  useEffect(() => {
    localStorage.setItem("penpad_todos", JSON.stringify(tasks));
    if (!user) return;
    if (!dbInitialized) {
      console.debug("ToDoList: skipping Firestore write until DB initialized");
      return;
    }
    const userRef = doc(db, "users", user.uid);
    // write current tasks to Firestore (overwrite todos field)
    console.debug("ToDoList: writing tasks to Firestore, count=", tasks.length);
    setDoc(userRef, { todos: tasks }, { merge: true }).catch(() => {});
  }, [tasks, user, dbInitialized]);

  function addTask() {
    const text = input.trim();
    if (!text) return;
    setTasks((t) => [
      ...t,
      { id: Date.now(), text, completed: false },
    ]);
    setInput("");
  }

  function toggleComplete(id) {
    setTasks((t) => t.map((it) => (it.id === id ? { ...it, completed: !it.completed } : it)));
  }

  function deleteTask(id) {
    setTasks((t) => t.filter((it) => it.id !== id));
  }

  function onKeyDown(e) {
    if (e.key === "Enter") addTask();
  }

  return (
    <div>
      <Sidebar />
      <div className="todo-wrap" style={{ marginLeft: "60px", padding: "20px" }}>
        <h1>To Do List</h1>

        <div className="todo-container">
          <div className="todo-input-row">
            <input
              className="todo-input"
              placeholder="Add a new task..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
            />
            <button className="add-btn" onClick={addTask} aria-label="Add task">
              Add
            </button>
          </div>

          <ul className="todo-list">
            {tasks.length === 0 && <li className="empty">No tasks yet.</li>}
            {tasks.map((task) => (
              <li key={task.id} className={`todo-item ${task.completed ? "completed" : ""}`}>
                <label>
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleComplete(task.id)}
                  />
                  <span className="todo-text">{task.text}</span>
                </label>
                <button className="delete-btn" onClick={() => deleteTask(task.id)} aria-label="Delete task">
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}