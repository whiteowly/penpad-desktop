import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import {
  Notebook,
  Calendar,
  ListTodo,
  DollarSign,
  Moon,
  Clock,
  Plus,
  LayoutDashboard,
  User
} from "lucide-react";
import "./Sidebar.css";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // if (location.pathname === "/dashboard") return null;

  const menuItems = [
    { name: "Journal", icon: <Notebook size={22} />, path: "/journal" },
    { name: "Period Tracker", icon: <Calendar size={22} />, path: "/period-tracker" },
    { name: "To-Do List", icon: <ListTodo size={22} />, path: "/to-do-list" },
    { name: "Budget Tracker", icon: <DollarSign size={22} />, path: "/budget-tracker" },
    { name: "Schedule", icon: <Clock size={22} />, path: "/schedule" },
    { name: "Sleep Tracker", icon: <Moon size={22} />, path: "/sleep-tracker" },
    { name: "Create Your List", icon: <Plus size={22} />, path: "/create-your-list" },
    { name: "Summary", icon: <LayoutDashboard size={22} />, path: "/summary" },
  ];

  return (
    <>
      <button
        className={`mobile-toggle-btn ${isMobileOpen ? 'hidden' : ''}`}
        onClick={() => setIsMobileOpen(true)}
      >
        P
      </button>

      {isMobileOpen && (
        <div className="mobile-overlay" onClick={() => setIsMobileOpen(false)} />
      )}

      <div
        className={`sidebar ${isMobileOpen ? 'mobile-open' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="logo-container">
          <h1
            className="logo-text"
            onClick={() => navigate("/dashboard")}
          >
            penpad
          </h1>
        </div>
        <ul className="menu-list">
          {menuItems.map((item, index) => (
            <li
              key={index}
              className={`menu-item ${location.pathname === item.path ? "active" : ""}`}
              onClick={() => {
                navigate(item.path);
                setIsMobileOpen(false);
              }}
            >
              <div className="icon-wrapper">{item.icon}</div>
              <span className="menu-text">{item.name}</span>
            </li>
          ))}
        </ul>

        <div
          className={`sidebar-profile ${location.pathname === "/profile" ? "active" : ""}`}
          onClick={() => {
            navigate("/profile");
            setIsMobileOpen(false);
          }}
        >
          <div className="profile-image-wrapper">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="User" />
            ) : (
              <User size={22} />
            )}
          </div>
          <div className="profile-info">
            <span className="profile-name">{user?.displayName || "User"}</span>
            <span className="profile-subtext">View Profile</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
