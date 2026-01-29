import React, { useState, useEffect } from "react";
import "./PeriodTracker.css";
import Sidebar from "./sidebar";
import { db } from "../firebase";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { useAuth } from "../AuthContext";
import ErrorBoundary from "../ErrorBoundary";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Calendar, AlertCircle, Sparkles, Activity } from "lucide-react";

const COLORS = ["#ff4d6d", "#ff758f", "#ffb3c1", "#80ed99"];
const PHASES = [
  { name: "Menstrual", value: 5 },
  { name: "Follicular", value: 9 },
  { name: "Ovulation", value: 1 },
  { name: "Luteal", value: 13 },
];

function PeriodTracker() {
  const [lastPeriodDate, setLastPeriodDate] = useState("");
  const [cycleLength, setCycleLength] = useState(28);
  const [symptoms, setSymptoms] = useState([]);
  const [dbInitialized, setDbInitialized] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);

    const unsub = onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data().periodData || {};
        setLastPeriodDate(data.lastPeriodDate || "");
        setCycleLength(data.cycleLength || 28);
        setSymptoms(data.symptoms || []);
      }
      setDbInitialized(true);
    });

    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user || !dbInitialized) return;
    const userRef = doc(db, "users", user.uid);
    setDoc(userRef, {
      periodData: { lastPeriodDate, cycleLength, symptoms }
    }, { merge: true }).catch(() => { });
  }, [lastPeriodDate, cycleLength, symptoms, user, dbInitialized]);

  const toggleSymptom = (s) => {
    setSymptoms(prev => prev.includes(s) ? prev.filter(item => item !== s) : [...prev, s]);
  };

  const calculateDayInCycle = () => {
    if (!lastPeriodDate) return 0;
    const start = new Date(lastPeriodDate);
    const today = new Date();
    const diff = Math.floor((today - start) / (1000 * 60 * 60 * 24));
    return (diff % cycleLength) + 1;
  };

  const dayInCycle = calculateDayInCycle();
  const nextPeriodDate = lastPeriodDate
    ? new Date(new Date(lastPeriodDate).getTime() + cycleLength * 86400000).toLocaleDateString()
    : "Not set";

  const currentPhase = dayInCycle <= 5 ? "Menstrual" :
    dayInCycle <= 14 ? "Follicular" :
      dayInCycle <= 15 ? "Ovulation" : "Luteal";

  const chartData = [
    { name: "Menstrual", value: 5, color: "#ff4d6d" },
    { name: "Follicular", value: 9, color: "#ffb3c1" },
    { name: "Ovulation", value: 1, color: "#c9184a" },
    { name: "Luteal", value: cycleLength - 15, color: "#590d22" },
  ];

  return (
    <div className="period-page">
      <Sidebar />
      <div className="period-content">
        <header className="period-header">
          <h1>Cycle Tracker</h1>
          <div className="header-stats">
            <div className="top-stat">
              <span className="label">Next Period</span>
              <span className="value">{nextPeriodDate}</span>
            </div>
            <div className="top-stat">
              <span className="label">Cycle Day</span>
              <span className="value">Day {dayInCycle || "--"}</span>
            </div>
          </div>
        </header>

        <div className="period-main-grid">
          {/* Chart Section */}
          <section className="period-card chart-card">
            <h2>Current Phase: {currentPhase}</h2>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={2}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke={currentPhase === entry.name ? "#fff" : "none"}
                        strokeWidth={currentPhase === entry.name ? 3 : 0}
                      />
                    ))}
                  </Pie>
                  <Tooltip cursor={{ stroke: '#ff4d6d', strokeWidth: 2 }} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
              <div className="day-display">
                <span>Day</span>
                <strong>{dayInCycle || 1}</strong>
              </div>
            </div>
          </section>

          {/* Settings Section */}
          <section className="period-card settings-card">
            <h2>Update Info</h2>
            <div className="input-group">
              <label>Last Period Start</label>
              <input
                type="date"
                value={lastPeriodDate}
                onChange={e => setLastPeriodDate(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label>Average Cycle (Days)</label>
              <input
                type="number"
                value={cycleLength}
                onChange={e => setCycleLength(parseInt(e.target.value) || 28)}
              />
            </div>
          </section>

          {/* Symptoms Section */}
          <section className="period-card symptoms-card">
            <h2>Today's Symptoms</h2>
            <div className="symptom-tags">
              {["Cramps", "Bloating", "Headache", "Cravings", "Moody", "Energetic", "Tired", "Backache"].map(s => (
                <button
                  key={s}
                  className={symptoms.includes(s) ? "active" : ""}
                  onClick={() => toggleSymptom(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </section>

          {/* Insights Section */}
          <section className="period-card insights-card">
            <h2>Daily Insights</h2>
            <ul className="insights-list">
              <li>
                <Sparkles size={18} color="#ff4d6d" />
                <p>Fertility is <strong>{dayInCycle >= 10 && dayInCycle <= 16 ? "High" : "Low"}</strong> today.</p>
              </li>
              <li>
                <Activity size={18} color="#ff4d6d" />
                <p>Stay hydrated to reduce common <strong>{currentPhase}</strong> symptoms.</p>
              </li>
              <li>
                <AlertCircle size={18} color="#ff4d6d" />
                <p>Next period starts in <strong>{cycleLength - dayInCycle}</strong> days.</p>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

export default function PeriodTrackerWithBoundary() {
  return (
    <ErrorBoundary>
      <PeriodTracker />
    </ErrorBoundary>
  );
}