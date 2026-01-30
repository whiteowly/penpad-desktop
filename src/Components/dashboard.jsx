import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import React from 'react';
import './dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const goToPage = (path) => {
    navigate(path);
  };

  return (
    <div className="dashboard">
      <h1>Hello There!</h1>
      <p>What's Cooking, Good Looking?</p>
    </div>
  );
}
