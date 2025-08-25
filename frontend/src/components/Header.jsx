import React, { useState, useEffect } from "react";
import { Sun, User, Search, LogOut, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SearchAll, Logout, GetAllUsers } from "wailsjs/go/main/App";
import "../styles/Header.css";

export default function Header() {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [user, setUser] = useState({ id: null, username: "" });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [brightness, setBrightness] = useState(1);
  const [allUsers, setAllUsers] = useState([]);
  const navigate = useNavigate();

  // Load token và user từ localStorage, đồng thời load danh sách users
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setIsLoggedIn(true);
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      GetAllUsers()
        .then((users) => setAllUsers(users))
        .catch((err) => console.error("Lỗi lấy danh sách users:", err));
    } else {
      setIsLoggedIn(false);
      setUser({ id: null, username: "" });
    }
  }, []);

  const handleLogout = () => {
    Logout()
      .then(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsLoggedIn(false);
        setUser({ id: null, username: "" });
        navigate("/login");
      })
      .catch((err) => console.error(err));
  };

  const handleLoginRedirect = () => navigate("/login");

  useEffect(() => {
    if (!keyword) return setResults([]);
    const timer = setTimeout(() => {
      if (isLoggedIn) {
        SearchAll(keyword)
          .then((res) => setResults(res || []))
          .catch((err) => console.error(err));
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [keyword, isLoggedIn]);

  const handleSelectResult = (item) => {
    switch (item.type) {
      case "equipment":
        navigate(`/equipments/${item.id}`);
        break;
      case "supplier":
        navigate(`/suppliers/${item.id}`);
        break;
      case "maintenance":
        navigate(`/maintenance/${item.id}`);
        break;
      case "repair":
        navigate(`/repairs/${item.id}`);
        break;
      default:
        break;
    }
    setKeyword("");
    setShowDropdown(false);
  };

  const handleBrightnessChange = (e) => {
    const value = Number(e.target.value);
    setBrightness(value);
    document.body.style.filter = `brightness(${value})`;
  };

  const displayUsername = () => {
    if (!isLoggedIn || !user.id) return "Guest";
    const foundUser = allUsers.find((u) => u.id === user.id);
    return foundUser ? foundUser.username : user.username;
  };

  return (
    <header className="header">
      <div className="header-left">
        <span className="app-name">Device Management</span>
      </div>

      <div className="header-center">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search..."
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            disabled={!isLoggedIn}
          />
          <Search size={16} className="search-icon" />
          {showDropdown && results.length > 0 && (
            <div className="search-dropdown">
              {results.map((item, idx) => (
                <div
                  key={idx}
                  className="search-item"
                  onClick={() => handleSelectResult(item)}
                >
                  {item.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="header-right">
        {/* Brightness slider */}
        <div className="brightness-control">
          <input
            type="range"
            min="0.3"
            max="1.2"
            step="0.01"
            value={brightness}
            onChange={handleBrightnessChange}
            title="Điều chỉnh độ sáng màn hình"
          />
          <Sun size={16} className="brightness-icon" />
        </div>

        <div className="header-user" onClick={() => setUserMenuOpen(!userMenuOpen)}>
          <User size={20} className="icon-hover" />
          <span>{displayUsername()}</span>
          {userMenuOpen && (
            <div className="user-dropdown">
              {isLoggedIn ? (
                <button className="dropdown-item" onClick={handleLogout}>
                  <LogOut size={16} /> Logout
                </button>
              ) : (
                <button className="dropdown-item" onClick={handleLoginRedirect}>
                  <LogIn size={16} /> Login
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
