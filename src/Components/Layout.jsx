// Layout.jsx
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./sidebar";
import { useTheme } from "../ThemeContext";
import "./Sidebar.css";

const Layout = () => {
  const location = useLocation();
  const { theme } = useTheme();

  const hideSidebar = ["/", "/login", "/new-user", "/existing-user"].includes(location.pathname);

  return (
    <div className={`app-layout ${theme}`} data-theme={theme}>
      {!hideSidebar && <Sidebar />}
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
