import React, { useEffect, useState } from "react";
import "./Schedule.css";
import Sidebar from "./sidebar";
import { useAuth } from "../AuthContext";
import { db } from "../firebase";
import { doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";

export default function Schedule() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [events, setEvents] = useState(() => {
    try {
      const saved = localStorage.getItem("penpad_schedule");
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });
  const [eventInput, setEventInput] = useState("");
  const [dbInitialized, setDbInitialized] = useState(false);

  // Sync with Firestore
  useEffect(() => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);

    (async () => {
      try {
        const snap = await getDoc(userRef);
        const dbSchedule = snap.exists() ? snap.data().schedule || {} : {};
        const local = JSON.parse(localStorage.getItem("penpad_schedule") || "{}");
        if (Object.keys(dbSchedule).length === 0 && Object.keys(local).length > 0) {
          await setDoc(userRef, { schedule: local }, { merge: true });
        }
      } catch (e) {
        console.debug("Schedule: getDoc error", e);
      }
    })();

    let initial = true;
    const unsub = onSnapshot(userRef, (snap) => {
      if (!snap.exists()) {
        const local = JSON.parse(localStorage.getItem("penpad_schedule") || "{}");
        if (initial && Object.keys(local).length > 0) {
          setDoc(userRef, { schedule: local }, { merge: true }).catch((err) => console.error(err));
        }
        initial = false;
        setDbInitialized(true);
        return;
      }

      const dbSchedule = snap.data().schedule || {};
      setEvents(dbSchedule);
      localStorage.setItem("penpad_schedule", JSON.stringify(dbSchedule));
      initial = false;
      setDbInitialized(true);
    });

    return () => unsub();
  }, [user]);

  // Persist to Firestore
  useEffect(() => {
    localStorage.setItem("penpad_schedule", JSON.stringify(events));
    if (!user || !dbInitialized) return;
    const userRef = doc(db, "users", user.uid);
    setDoc(userRef, { schedule: events }, { merge: true }).catch(() => { });
  }, [events, user, dbInitialized]);

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateClick = (day) => {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(d.toDateString());
  };

  const addEvent = (e) => {
    e.preventDefault();
    if (!eventInput || !selectedDate) return;

    setEvents((prev) => {
      const dayEvents = prev[selectedDate] || [];
      return {
        ...prev,
        [selectedDate]: [...dayEvents, { id: Date.now(), text: eventInput }],
      };
    });
    setEventInput("");
  };

  const deleteEvent = (date, id) => {
    setEvents((prev) => {
      const dayEvents = prev[date].filter((ev) => ev.id !== id);
      const newEvents = { ...prev };
      if (dayEvents.length === 0) {
        delete newEvents[date];
      } else {
        newEvents[date] = dayEvents;
      }
      return newEvents;
    });
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);
    const days = [];

    // Padding for start of month
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Days of the month
    for (let d = 1; d <= totalDays; d++) {
      const fullDate = new Date(year, month, d).toDateString();
      const hasEvents = events[fullDate] && events[fullDate].length > 0;
      const isToday = new Date().toDateString() === fullDate;
      const isSelected = selectedDate === fullDate;

      days.push(
        <div
          key={d}
          className={`calendar-day ${isToday ? "today" : ""} ${isSelected ? "selected" : ""} ${hasEvents ? "has-events" : ""}`}
          onClick={() => handleDateClick(d)}
        >
          <span className="day-number">{d}</span>
          {hasEvents && <div className="event-indicator"></div>}
        </div>
      );
    }

    return days;
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="schedule-page">
      <Sidebar />
      <div className="schedule-content">
        <h1>Schedule</h1>

        <div className="calendar-container">
          <div className="calendar-header">
            <button onClick={prevMonth}>&lt;</button>
            <h2>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
            <button onClick={nextMonth}>&gt;</button>
          </div>

          <div className="calendar-grid">
            <div className="day-name">Sun</div>
            <div className="day-name">Mon</div>
            <div className="day-name">Tue</div>
            <div className="day-name">Wed</div>
            <div className="day-name">Thu</div>
            <div className="day-name">Fri</div>
            <div className="day-name">Sat</div>
            {renderCalendar()}
          </div>
        </div>

        <div className="event-panel">
          {selectedDate ? (
            <>
              <h3>Events for {selectedDate}</h3>
              <form onSubmit={addEvent} className="event-form">
                <input
                  type="text"
                  placeholder="New event..."
                  value={eventInput}
                  onChange={(e) => setEventInput(e.target.value)}
                />
                <button type="submit">Add</button>
              </form>
              <ul className="event-list">
                {events[selectedDate] ? (
                  events[selectedDate].map((ev) => (
                    <li key={ev.id}>
                      <span>{ev.text}</span>
                      <button onClick={() => deleteEvent(selectedDate, ev.id)}>×</button>
                    </li>
                  ))
                ) : (
                  <li className="no-events">No events scheduled.</li>
                )}
              </ul>
            </>
          ) : (
            <p className="select-date-msg">Select a date to view or add events.</p>
          )}
        </div>
      </div>
    </div>
  );
}
