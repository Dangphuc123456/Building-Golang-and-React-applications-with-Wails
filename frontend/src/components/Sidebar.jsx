import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/Sidebar.css";

const menuItems = [
  { page: "/", id: 1, icon: "🏠", name: "Dashboard" },
  { page: "/suppliers", id: 2, icon: "🚚", name: "Suppliers" },
  { page: "/equipments", id: 3, icon: "💻", name: "Equipments" },
  { page: "/maintenance", id: 4, icon: "📅", name: "Maintenance" },
  { page: "/repairs", id: 5, icon: "🔧", name: "Repair History" },
  { page: "/user", id: 6, icon: "👤", name: "Users" },
];

export default function Sidebar() {
  const [expanded, setExpanded] = useState(true);
  const [role, setRole] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const nav = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setRole(user?.role?.toLowerCase() || "");
    setIsLoggedIn(!!localStorage.getItem("token"));
  }, [location.pathname]);


  useEffect(() => {
    const handleStorageChange = () => {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      setRole((user.role || "").toLowerCase());
      setIsLoggedIn(!!localStorage.getItem("token"));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleClick = (item, disabled) => {
    if (disabled) return;
    nav(item.page);
  };

  return (
    <aside className={`sidebar ${expanded ? "expanded" : "collapsed"}`}>
      <nav className="menu">
        {menuItems.map((item) => {
          const disabled = !isLoggedIn ||
            (role === "technician" && ["/user", "/suppliers", "/equipments"].includes(item.page)) ||
            (role === "staff" && item.page === "/user");


          return (
            <div
              key={item.id}
              className={`menu-item ${location.pathname === item.page ? "active" : ""} ${disabled ? "disabled" : ""}`}
              onClick={() => handleClick(item, disabled)}
              style={{
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: disabled ? 0.5 : 1,
              }}
              title={disabled ? "Bạn không có quyền truy cập" : ""}
            >
              <div className="icon">{item.icon}</div>
              {expanded && <div className="label">{item.name}</div>}
            </div>
          );
        })}
      </nav>
      <button className="toggle-btn" onClick={() => setExpanded(!expanded)}>
        {expanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
      </button>
    </aside>
  );
}
