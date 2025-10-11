// Layout.jsx
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./sidebar";
import "./Sidebar.css"; // ✅ ensure styles are imported

const Layout = () => {
  const location = useLocation();

  return (
    <div style={{ display: "flex" }}>
      {location.pathname !== "/dashboard" && <Sidebar />}
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
