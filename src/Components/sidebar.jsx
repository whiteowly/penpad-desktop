import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Notebook,
  Calendar,
  ListTodo,
  DollarSign,
  Moon,
  Clock,
  Plus,
  LayoutDashboard
} from "lucide-react";
import "./Sidebar.css";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  if (location.pathname === "/dashboard") return null;

  const menuItems = [
    { name: "Journal", icon: <Notebook size={22} />, path: "/journal" },
    { name: "Period Tracker", icon: <Calendar size={22} />, path: "/period-tracker" },
    { name: "To-Do List", icon: <ListTodo size={22} />, path: "/to-do-list" },
    { name: "Budget Tracker", icon: <DollarSign size={22} />, path: "/budget-tracker" },
    { name: "Schedule", icon: <Clock size={22} />, path: "/schedule" },
    { name: "Summary", icon: <LayoutDashboard size={22} />, path: "/summary" },
    { name: "Sleep Tracker", icon: <Moon size={22} />, path: "/sleep-tracker" },
    { name: "Create Your List", icon: <Plus size={22} />, path: "/create-your-list" },
  ];

  return (
    <div
      className="sidebar"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="logo-container">
        <img
          src={isHovered ? "/logoHover.png" : "/logo.png"}
          alt="Penpad Logo"
          className="logo"
        />
      </div>
      <ul className="menu-list">
        {menuItems.map((item, index) => (
          <li
            key={index}
            className={`menu-item ${location.pathname === item.path ? "active" : ""}`}
            onClick={() => navigate(item.path)}
          >
            <div className="icon-wrapper">{item.icon}</div>
            <span className="menu-text">{item.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
