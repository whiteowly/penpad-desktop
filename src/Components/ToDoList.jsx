import React, { useEffect, useState } from "react";
import "./ToDoList.css";
import { useAuth } from "../AuthContext";
import { db } from "../firebase";
import { doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";
import { Trash2, CheckCircle2, Circle, Plus, Filter, Layout } from "lucide-react";

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
  const [category, setCategory] = useState("Personal");
  const [showModal, setShowModal] = useState(false);
  const [dbInitialized, setDbInitialized] = useState(false);

  useEffect(() => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);

    (async () => {
      try {
        const snap = await getDoc(userRef);
        const dbTasks = snap.exists() ? snap.data().todos || [] : [];
        const local = JSON.parse(localStorage.getItem("penpad_todos") || "[]");
        if ((!dbTasks || dbTasks.length === 0) && local && local.length > 0) {
          await setDoc(userRef, { todos: local }, { merge: true });
        }
      } catch (e) {
        console.debug("ToDoList: getDoc error", e);
      }
    })();

    let initial = true;
    const unsub = onSnapshot(userRef, (snap) => {
      if (!snap.exists()) {
        const local = JSON.parse(localStorage.getItem("penpad_todos") || "[]");
        if (initial && local.length > 0) {
          setDoc(userRef, { todos: local }, { merge: true }).catch(() => { });
        }
        initial = false;
        setDbInitialized(true);
        return;
      }
      const dbTasks = snap.data().todos || [];
      setTasks(dbTasks);
      localStorage.setItem("penpad_todos", JSON.stringify(dbTasks));
      initial = false;
      setDbInitialized(true);
    });

    return () => unsub();
  }, [user]);

  useEffect(() => {
    localStorage.setItem("penpad_todos", JSON.stringify(tasks));
    if (!user || !dbInitialized) return;
    const userRef = doc(db, "users", user.uid);
    setDoc(userRef, { todos: tasks }, { merge: true }).catch(() => { });
  }, [tasks, user, dbInitialized]);

  function addTask() {
    const text = input.trim();
    if (!text) return;
    setTasks((t) => [
      ...t,
      { id: Date.now(), text, completed: false, category, date: new Date().toISOString() },
    ]);
    setInput("");
    setShowModal(false);
  }

  function toggleComplete(id) {
    setTasks((t) => t.map((it) => (it.id === id ? { ...it, completed: !it.completed } : it)));
  }

  function deleteTask(id) {
    setTasks((t) => t.filter((it) => it.id !== id));
  }

  function clearCompleted() {
    if (window.confirm("Delete all completed tasks?")) {
      setTasks((t) => t.filter((it) => !it.completed));
    }
  }

  const completedCount = tasks.filter(t => t.completed).length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  // Group tasks by category
  const categories = ["Personal", "Work", "Class", "Other"];
  const groupedTasks = categories.reduce((acc, cat) => {
    acc[cat] = tasks.filter(t => (t.category || "Personal") === cat);
    return acc;
  }, {});

  // Handle unknown categories
  const knownCats = new Set(categories);
  const others = tasks.filter(t => !knownCats.has(t.category || "Personal"));
  if (others.length > 0) groupedTasks["Others"] = others;

  return (
    <div className="todo-page">

      <div className="todo-content">
        <header className="todo-header">

          <div className="stats-row">
            <div className="stat-pill">
              <CheckCircle2 size={16} />
              <span>{completedCount}/{tasks.length} Resolved</span>
            </div>
            <button className="clear-btn" onClick={clearCompleted}>Clear Done</button>
          </div>
        </header>

        <section className="progress-section">
          <div className="progress-info">
            <span>Overall Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
          </div>
        </section>

        <div className="categories-grid">
          {Object.entries(groupedTasks).map(([cat, catTasks]) => (
            catTasks.length > 0 && (
              <div key={cat} className="category-group">
                <h3 className="category-header">{cat}</h3>
                <ul className="modern-todo-list">
                  {catTasks.map((task) => (
                    <li key={task.id} className={`modern-todo-item ${task.completed ? "task-done" : ""}`}>
                      <div className="task-main" onClick={() => toggleComplete(task.id)}>
                        {task.completed ? (
                          <CheckCircle2 className="check-icon done" size={22} />
                        ) : (
                          <Circle className="check-icon" size={22} />
                        )}
                        <span className="task-text">{task.text}</span>
                      </div>
                      <button className="item-delete" onClick={() => deleteTask(task.id)}>
                        <Trash2 size={18} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )
          ))}
          {tasks.length === 0 && (
            <div className="empty-state">
              <Layout size={48} />
              <p>Everything's clear! Relax or add a new goal.</p>
            </div>
          )}
        </div>

        {/* FAB */}
        <button className="fab" onClick={() => setShowModal(true)}>
          <Plus size={32} />
        </button>

        {/* Modal */}
        {showModal && (
          <div className="todo-overlay" onClick={() => setShowModal(false)}>
            <div className="todo-modal" onClick={e => e.stopPropagation()}>
              <h2>Add New Task</h2>
              <input
                autoFocus
                placeholder="What needs to be done?"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTask()}
              />

              <div className="category-chips">
                {categories.map(cat => (
                  <button
                    key={cat}
                    className={`chip ${category === cat ? 'active' : ''}`}
                    onClick={() => setCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="modal-actions">
                <button className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="save-btn" onClick={addTask}>Add Task</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
