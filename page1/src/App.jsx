

import React, { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";

import Loder from "./components/Loder";
import CustomCursor from "./components/CustomCursor";
import Log_in from "./components/Log_in";
import Registration from "./components/registration";
import Super_Admin from './components/Super_Admin';
import Admin_Dashboard from './components/Admin_Dashboard';
import StudentDashboard from './components/StudentDashboard';

// ⭐ ADD THIS IMPORT (very important!)
import Teacher_Dashboard from './components/Teacher_Dashboard';  // ← adjust path if needed

// ⭐ ADD THIS IMPORT (Make sure the path matches where your Lander.jsx is saved)
import Landing from "./components/Landing";

import "./App.css";

function App() {
  const navigate = useNavigate();
  const [isDone, setIsDone] = useState(false);
  const [loaderKey, setLoaderKey] = useState(() => Date.now());

  const handleRegistrationSuccess = () => {
    setIsDone(false);
    setLoaderKey(Date.now());
    navigate("/login"); // Updated to go to /login instead of /
  };

  return (
    <div className="app-container" style={{ 
      background: "#050505", 
      minHeight: "100vh", 
      width: "100%", 
      overflowX: "hidden",
      overflowY: "auto",
      position: "relative" 
    }}>
      <CustomCursor />

      <div style={{ position: "relative", zIndex: 1, minHeight: "100vh" }}>
        <Routes>
          {/* 1. Landing Page as Home */}
          <Route 
            path="/" 
            element={<Landing />} 
          />

          {/* 2. Login Page moved to /login */}
          <Route 
            path="/login" 
            element={<Log_in onRegisterTrigger={() => navigate("/register")} />} 
          />
          
          <Route 
            path="/register" 
            element={<Registration onLoginTrigger={handleRegistrationSuccess} />} 
          />

          {/* Protected / role-based dashboards */}
          <Route path="/super-admin" element={<Super_Admin />} />
          <Route path="/admin-dashboard" element={<Admin_Dashboard />} />
          <Route path="/student-dashboard" element={<StudentDashboard />} />

          {/* Fixed: Now using the real Teacher_Dashboard component */}
          <Route path="/teacher-dashboard" element={<Teacher_Dashboard />} />

        </Routes>
      </div>

      {!isDone && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, pointerEvents: "none", isolation: "isolate" }}>
          <Loder key={loaderKey} onFinished={() => setIsDone(true)} />
        </div>
      )}
    </div>
  );
}

export default App;
