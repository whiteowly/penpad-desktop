import React, { useEffect, useState } from "react";
import "./SleepTracker.css";
import { useAuth } from "../AuthContext";
import { db } from "../firebase";
import { doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";

export default function SleepTracker() {
  const { user } = useAuth();
  const [logs, setLogs] = useState(() => {
    try {
      const saved = localStorage.getItem("penpad_sleep");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [bedtime, setBedtime] = useState("");
  const [waketime, setWaketime] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [quality, setQuality] = useState(3);
  const [dbInitialized, setDbInitialized] = useState(false);

  // Sync with Firestore
  useEffect(() => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);

    (async () => {
      try {
        const snap = await getDoc(userRef);
        const dbSleep = snap.exists() ? snap.data().sleepLogs || [] : [];
        const local = JSON.parse(localStorage.getItem("penpad_sleep") || "[]");
        if (dbSleep.length === 0 && local.length > 0) {
          await setDoc(userRef, { sleepLogs: local }, { merge: true });
        }
      } catch (e) {
        console.debug("SleepTracker: getDoc error", e);
      }
    })();

    let initial = true;
    const unsub = onSnapshot(userRef, (snap) => {
      if (!snap.exists()) {
        const local = JSON.parse(localStorage.getItem("penpad_sleep") || "[]");
        if (initial && local.length > 0) {
          setDoc(userRef, { sleepLogs: local }, { merge: true }).catch((err) => console.error(err));
        }
        initial = false;
        setDbInitialized(true);
        return;
      }

      const dbSleep = snap.data().sleepLogs || [];
      setLogs(dbSleep);
      localStorage.setItem("penpad_sleep", JSON.stringify(dbSleep));
      initial = false;
      setDbInitialized(true);
    });

    return () => unsub();
  }, [user]);

  // Persist to Firestore
  useEffect(() => {
    localStorage.setItem("penpad_sleep", JSON.stringify(logs));
    if (!user || !dbInitialized) return;
    const userRef = doc(db, "users", user.uid);
    setDoc(userRef, { sleepLogs: logs }, { merge: true }).catch(() => { });
  }, [logs, user, dbInitialized]);

  const calculateDuration = (start, end) => {
    if (!start || !end) return 0;
    let startDate = new Date(`2000-01-01T${start}`);
    let endDate = new Date(`2000-01-01T${end}`);

    if (endDate < startDate) {
      endDate.setDate(endDate.getDate() + 1);
    }

    const diffMs = endDate - startDate;
    return diffMs / (1000 * 60 * 60);
  };

  const addLog = (e) => {
    e.preventDefault();
    if (!bedtime || !waketime || !date) return;

    const duration = calculateDuration(bedtime, waketime);
    const newLog = {
      id: Date.now(),
      date,
      bedtime,
      waketime,
      duration,
      quality: parseInt(quality),
    };

    setLogs([newLog, ...logs]);
    setBedtime("");
    setWaketime("");
  };

  const deleteLog = (id) => {
    setLogs(logs.filter((l) => l.id !== id));
  };

  const avgDuration = logs.length > 0
    ? (logs.reduce((acc, l) => acc + l.duration, 0) / logs.length).toFixed(1)
    : 0;

  return (
    <div className="sleep-page">

      <div className="sleep-content">
        <h1>Sleep Tracker</h1>

        <div className="sleep-dashboard">
          <div className="stat-card">
            <h3>Avg. Sleep</h3>
            <p className="stat-value">{avgDuration}h</p>
          </div>
          <div className="stat-card">
            <h3>Last Session</h3>
            <p className="stat-value">
              {logs.length > 0 ? `${logs[0].duration.toFixed(1)}h` : "N/A"}
            </p>
          </div>
          <div className="stat-card">
            <h3>Total Logs</h3>
            <p className="stat-value">{logs.length}</p>
          </div>
        </div>

        <div className="sleep-main-grid">
          <div className="sleep-form-section">
            <h2>Log Sleep</h2>
            <form onSubmit={addLog} className="sleep-form">
              <div className="input-group">
                <label>Date</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>
              <div className="input-row">
                <div className="input-group">
                  <label>Bedtime</label>
                  <input type="time" value={bedtime} onChange={(e) => setBedtime(e.target.value)} required />
                </div>
                <div className="input-group">
                  <label>Wake-up</label>
                  <input type="time" value={waketime} onChange={(e) => setWaketime(e.target.value)} required />
                </div>
              </div>
              <div className="input-group">
                <label>Quality (1-5)</label>
                <div className="quality-selector">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      className={quality === num ? "active" : ""}
                      onClick={() => setQuality(num)}
                    >
                      {num === 1 ? "😫" : num === 2 ? "🥱" : num === 3 ? "😐" : num === 4 ? "🙂" : "😴"}
                    </button>
                  ))}
                </div>
              </div>
              <button type="submit" className="save-log-btn">Save Log</button>
            </form>
          </div>

          <div className="sleep-history-section">
            <h2>History</h2>
            <div className="log-list">
              {logs.length === 0 && <p className="empty-msg">No sleep logs yet.</p>}
              {logs.map((log) => (
                <div key={log.id} className="log-item">
                  <div className="log-info">
                    <span className="log-date">{new Date(log.date).toLocaleDateString()}</span>
                    <span className="log-times">{log.bedtime} - {log.waketime}</span>
                  </div>
                  <div className="log-stats">
                    <span className="log-duration">{log.duration.toFixed(1)}h</span>
                    <span className="log-quality">
                      {log.quality === 1 ? "😫" : log.quality === 2 ? "🥱" : log.quality === 3 ? "😐" : log.quality === 4 ? "🙂" : "😴"}
                    </span>
                    <button className="delete-btn" onClick={() => deleteLog(log.id)}>×</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
