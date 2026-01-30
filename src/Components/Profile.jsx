import React, { useState } from "react";
import { useAuth } from "../AuthContext";
import { useTheme } from "../ThemeContext";
import { auth } from "../firebase";
import { updateProfile, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { User, Mail, Moon, Sun, LogOut, Check } from "lucide-react";
import "./Profile.css";

const Profile = () => {
    const { user, refreshUser } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [newUsername, setNewUsername] = useState(user?.displayName || "");
    const [isUpdating, setIsUpdating] = useState(false);
    const [message, setMessage] = useState("");

    const handleUpdateUsername = async (e) => {
        e.preventDefault();
        if (!newUsername.trim()) return;
        setIsUpdating(true);
        try {
            await updateProfile(auth.currentUser, {
                displayName: newUsername,
            });
            await refreshUser();
            setMessage("Username updated successfully!");
            setTimeout(() => setMessage(""), 3000);
        } catch (error) {
            console.error("Error updating profile:", error);
            setMessage("Failed to update username.");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate("/login");
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    return (
        <div className="profile-container">


            <div className="profile-card">
                <div className="avatar-section">
                    <div className="profile-avatar">
                        {user?.photoURL ? (
                            <img src={user.photoURL} alt="User Avatar" />
                        ) : (
                            <User size={60} />
                        )}
                    </div>
                    <h2 className="profile-name">{user?.displayName || "User"}</h2>
                    <p className="profile-email">{user?.email}</p>
                </div>

                <form className="profile-form" onSubmit={handleUpdateUsername}>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <div className="input-with-icon">
                            <User size={18} className="input-icon" />
                            <input
                                type="text"
                                id="username"
                                value={newUsername}
                                onChange={(e) => setNewUsername(e.target.value)}
                                placeholder="Enter new username"
                            />
                        </div>
                    </div>
                    <button type="submit" className="update-btn" disabled={isUpdating}>
                        {isUpdating ? "Updating..." : "Update Username"}
                    </button>
                    {message && <p className="success-message">{message}</p>}
                </form>

                <div className="settings-section">
                    <h3>Preferences</h3>
                    <div className="setting-item" onClick={toggleTheme}>
                        <div className="setting-info">
                            {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
                            <span>{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
                        </div>
                        <div className={`toggle-switch ${theme === "dark" ? "on" : ""}`}>
                            <div className="toggle-knob"></div>
                        </div>
                    </div>
                </div>

                <button className="logout-btn" onClick={handleLogout}>
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Profile;
