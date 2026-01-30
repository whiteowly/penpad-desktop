import React, { useEffect, useState } from "react";
import "./Summary.css";

import { useAuth } from "../AuthContext";
import { db } from "../firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { Notebook, Calendar, Clock, DollarSign, Moon } from "lucide-react";

export default function Summary() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [dayData, setDayData] = useState({
    journal: [],
    schedule: [],
    budget: [],
    sleep: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchDaySummary = async () => {
      setLoading(true);
      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.exists() ? userSnap.data() : {};

        // 1. Fetch Journal Entries (Collection)
        const journalQuery = query(
          collection(db, "journalEntries"),
          where("userId", "==", user.uid)
        );
        const journalSnap = await getDocs(journalQuery);
        const rawDate = new Date(selectedDate).toLocaleDateString();
        const filteredJournal = journalSnap.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(entry => entry.date && entry.date.includes(rawDate));

        // 2. Schedule (Object in User Doc)
        const scheduleDateKey = new Date(selectedDate).toDateString();
        const filteredSchedule = userData.schedule ? userData.schedule[scheduleDateKey] || [] : [];

        // 3. Budget (Array in User Doc)
        const filteredBudget = userData.budget
          ? userData.budget.filter(t => t.date && t.date.split("T")[0] === selectedDate)
          : [];

        // 4. Sleep (Array in User Doc)
        const filteredSleep = userData.sleepLogs
          ? userData.sleepLogs.find(l => l.date === selectedDate)
          : null;

        setDayData({
          journal: filteredJournal,
          schedule: filteredSchedule,
          budget: filteredBudget,
          sleep: filteredSleep,
        });
      } catch (err) {
        console.error("Error fetching summary:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDaySummary();
  }, [user, selectedDate]);

  const totalIncome = dayData.budget
    .filter(t => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = dayData.budget
    .filter(t => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="summary-page">

      <div className="summary-content">
        <div className="summary-header">
          <h1>Day Summary</h1>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="summary-date-picker"
          />
        </div>

        {loading ? (
          <div className="loading">Loading your day...</div>
        ) : (
          <div className="summary-grid">
            {/* Journal Section */}
            <div className="summary-section">
              <div className="section-title">
                <Notebook size={20} />
                <h2>Journal Entries</h2>
              </div>
              <div className="section-body">
                {dayData.journal.length > 0 ? (
                  dayData.journal.map(entry => (
                    <div key={entry.id} className="summary-item journal-item">
                      <h3>{entry.title}</h3>
                      <p>{entry.content}</p>
                    </div>
                  ))
                ) : <p className="empty">No journal entries for this day.</p>}
              </div>
            </div>

            {/* Schedule Section */}
            <div className="summary-section">
              <div className="section-title">
                <Clock size={20} />
                <h2>Schedule</h2>
              </div>
              <div className="section-body">
                {dayData.schedule.length > 0 ? (
                  dayData.schedule.map(ev => (
                    <div key={ev.id} className="summary-item schedule-item">
                      <p>{ev.text}</p>
                    </div>
                  ))
                ) : <p className="empty">Nothing on the schedule.</p>}
              </div>
            </div>

            {/* Budget Section */}
            <div className="summary-section">
              <div className="section-title">
                <DollarSign size={20} />
                <h2>Finances</h2>
              </div>
              <div className="section-body">
                <div className="fin-summary">
                  <span className="inc">+{totalIncome.toFixed(2)}</span>
                  <span className="exp">-{totalExpense.toFixed(2)}</span>
                </div>
                {dayData.budget.length > 0 ? (
                  dayData.budget.map(t => (
                    <div key={t.id} className={`summary-item budget-item ${t.type}`}>
                      <span>{t.text}</span>
                      <span className="amt">${t.amount.toFixed(2)}</span>
                    </div>
                  ))
                ) : <p className="empty">No transactions recorded.</p>}
              </div>
            </div>

            {/* Sleep Section */}
            <div className="summary-section">
              <div className="section-title">
                <Moon size={20} />
                <h2>Sleep</h2>
              </div>
              <div className="section-body">
                {dayData.sleep ? (
                  <div className="summary-item sleep-summary">
                    <div className="sleep-main">
                      <span className="duration">{dayData.sleep.duration.toFixed(1)}h</span>
                      <span className="mood">
                        {dayData.sleep.quality === 1 ? "😫" : dayData.sleep.quality === 2 ? "🥱" : dayData.sleep.quality === 3 ? "😐" : dayData.sleep.quality === 4 ? "🙂" : "😴"}
                      </span>
                    </div>
                    <p className="times">{dayData.sleep.bedtime} to {dayData.sleep.waketime}</p>
                  </div>
                ) : <p className="empty">No sleep data for this day.</p>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
