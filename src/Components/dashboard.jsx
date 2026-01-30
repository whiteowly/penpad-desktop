import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import React from 'react';
// import './dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const goToPage = (path) => {
    navigate(path);
  };

  return (
    <div className="dashboard">
      <div className="SideBar">
        <img src='/logo.png' alt='PenpadLogo'></img>
        <button onClick={() => goToPage('/journal')}>Journal</button>
        <button onClick={() => goToPage('/period-tracker')}>Period Tracker</button>
        <button onClick={() => goToPage('/to-do-list')}>To-Do List</button>
        <button onClick={() => goToPage('/budget-tracker')}>Budget Tracker</button>
        <button onClick={() => goToPage('/schedule')}>Schedule</button>
        <button onClick={() => goToPage('/reminders')}>Reminders</button>
        <button onClick={() => goToPage('/sleep-tracker')}>Sleep Tracker</button>
        <button onClick={() => goToPage('/create-your-list')}>Create Your List</button>
      </div>

      <div className="main-content">

        <div className="top-bar">
          <img
            src="/Users.jpg"
            alt="User Settings"
            className="UsersIcon"
            onClick={() => console.log('Open settings')}
          />
        </div>
        <h1>Hello There!</h1>
        <p>What's Cooking, Good Looking?
        </p>
      </div>

    </div>
  );
}
