// Sidebar.jsx
import { useLocation, useNavigate } from "react-router-dom";
import { Notebook, Calendar, ListTodo, DollarSign, Bell, Moon, Clock, Plus } from "lucide-react";
import "./Sidebar.css"; 

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  if (location.pathname === "/dashboard") return null;
  
  const menuItems = [
   
    { name: "Journal", icon: <Notebook size={22} />, path: "/journal" },
    { name: "Period Tracker", icon: <Calendar size={22} />, path: "/period-tracker" },
    { name: "To-Do List", icon: <ListTodo size={22} />, path: "/to-do-list" },
    { name: "Budget Tracker", icon: <DollarSign size={22} />, path: "/budget-tracker" },
    { name: "Schedule", icon: <Clock size={22} />, path: "/schedule" },
    { name: "Reminders", icon: <Bell size={22} />, path: "/reminders" },
    { name: "Sleep Tracker", icon: <Moon size={22} />, path: "/sleep-tracker" },
    { name: "Create Your List", icon: <Plus size={22} />, path: "/create-your-list" },
  ];

  return (
    <div className="sidebar">
      <div className="logo-container">
        <img src="./bgColor.jpg" alt="background" className="logo"></img>
        
      
      </div>
      <ul>
        {menuItems.map((item, index) => (
          <li
            key={index}
            className={`menu-item ${location.pathname === item.path ? "active" : ""}`}
            onClick={() => navigate(item.path)}
          >
            {item.icon}
            <span className="menu-text">{item.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
