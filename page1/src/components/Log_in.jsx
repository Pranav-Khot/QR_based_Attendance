
import React, { useState, useRef } from "react";
import "../styles/Log_in.css";
import { useNavigate } from "react-router-dom";

import curveImage from "../assets/Rectangle.png";
import avatar from "../assets/avatar.png";
import yellowBlob1 from "../assets/Rectangle 1.svg";
import yellowBlob2 from "../assets/Rectangle 6.svg";
import logo from "../assets/fc-logo.png";
import { GoogleLogin } from '@react-oauth/google';

const Log_in = ({ onRegisterTrigger }) => {
  const navigate = useNavigate();

  /* ================= STATE & REFS ================= */
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showForgot, setShowForgot] = useState(false);
  const [step, setStep] = useState(1); // Step 1: Email, Step 2: OTP & Reset
  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [btnPos, setBtnPos] = useState({ x: 50, y: 50 });
  const [preview, setPreview] = useState({
    visible: false,
    x: 0,
    y: 0,
    type: "",
  });

  const containerRef = useRef(null);

  // ────────────────────────────────────────────────
  //          OTP / Forgot Password Logic (unchanged)
  // ────────────────────────────────────────────────
  const handleSendOTP = async () => {
    if (!forgotEmail) return alert("Please enter email");

    try {
      const res = await fetch("http://localhost:5001/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("OTP sent successfully!");
        setStep(2);
      } else {
        alert("Error: " + data.message);
      }
    } catch {
      alert("Server se connection nahi ho paa raha!");
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) return alert("Please enter OTP");

    try {
      const res = await fetch("http://localhost:5001/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: forgotEmail,
          otp: otp
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("OTP Verified! Now set your new password.");
        setStep(3);
      } else {
        alert(data.message || "Invalid OTP");
      }
    } catch {
      alert("Verification failed!");
    }
  };

  const handleResetSubmit = async () => {
    if (!newPassword) return alert("Please enter new password");

    try {
      const res = await fetch("http://localhost:5001/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: forgotEmail,
          otp: otp,
          newPassword: newPassword
        }),
      });

      if (res.ok) {
        alert("Password Updated Successfully!");
        setShowForgot(false);
        setStep(1);
      } else {
        alert("Something went wrong. Try again.");
      }
    } catch {
      alert("Update failed!");
    }
  };

  // ────────────────────────────────────────────────
  //          Google Login (improved with role check)
  // ────────────────────────────────────────────────
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await fetch("http://localhost:5001/api/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);

        // ────── Role-based navigation ──────
        const role = (data.role || "").toLowerCase().trim();

        if (["superadmin", "super_admin", "super admin"].includes(role)) {
          navigate("/super-admin");
        } else if (["admin", "normaladmin"].includes(role)) {
          navigate("/admin-dashboard");
        } else if (["teacher", "faculty", "professor"].includes(role)) {
          navigate("/teacher-dashboard");
        } else {
          // default → student / user
          navigate("/student-dashboard");
        }

        // alert("Login Successful!");   // optional
      } else {
        console.error("Backend Error:", data.message);
        alert("Google login failed: " + data.message);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      alert("Google login error occurred.");
    }
  };

  // ────────────────────────────────────────────────
  //          Normal Email + Password Login (improved)
  // ────────────────────────────────────────────────
  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5001/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);

        // ────── Role-based navigation (more flexible) ──────
        const role = (data.role || "").toLowerCase().trim();

        if (["superadmin", "super_admin", "super admin"].includes(role)) {
          navigate("/super-admin");
        } else if (["admin", "normaladmin", "normal_admin"].includes(role)) {
          navigate("/admin-dashboard");
        } else if (["teacher", "faculty", "professor"].includes(role)) {
          navigate("/teacher-dashboard");
        } else {
          // student / user / default
          navigate("/student-dashboard");
        }

        // alert(data.message);   // optional — can be removed for better UX
      } else {
        alert(data.message || "Invalid Credentials");
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert("Backend is not connected or something went wrong!");
    }
  };

  /* ================= MOUSE MOVE LOGIC (unchanged) ================= */
  const handleMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
    const yPercent = ((e.clientY - rect.top) / rect.height) * 100;
    setBtnPos({ x: xPercent, y: yPercent });
  };

  const handleEnter = (type, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPreview({
      visible: true,
      type,
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    });
  };

  const handleLeave = () => {
    setPreview((p) => ({ ...p, visible: false }));
    setBtnPos({ x: 50, y: 50 });
  };

  const handleViewClick = (e) => {
    e.stopPropagation();
    setPreview({ visible: false, type: "", x: 0, y: 0 });
    window.open("https://www.fortunecloudindia.com/Success-Stories", "_blank", "noopener,noreferrer");
  };

  const handleViewClick1 = (e) => {
    e.stopPropagation();
    setPreview({ visible: false, type: "", x: 0, y: 0 });
    window.open("https://www.fortunecloudindia.com/courses", "_blank", "noopener,noreferrer");
  };

  const handleViewClick2 = (e) => {
    e.stopPropagation();
    setPreview({ visible: false, type: "", x: 0, y: 0 });
    window.open("http://www.youtube.com/@FortuneCloud", "_blank", "noopener,noreferrer");
  };

  // ────────────────────────────────────────────────
  //                   RENDER
  // ────────────────────────────────────────────────
  return (
    <div className="fc-layout-wrapper" ref={containerRef}>
      <div className="login-container">
        <div className="main-green-bg">
          <div className="fc-logo">
            <img src={logo} alt="Fortune Cloud Logo" />
          </div>

          <img src={yellowBlob1} className="yellow-shape-1" alt="" />
          <img src={yellowBlob2} className="yellow-shape-2" alt="" />
          <img src={curveImage} className="student-img" alt="design-curve" />

          <div className="main-title1">
            <span>
              <span className="subhead1">WELCOME</span> TO FORTUNE CLOUD
            </span>
          </div>

          <div className="center-wrapper-responsive">
            <div className="menu-list">
              <div className="menu-row-top" style={{ display: 'flex', gap: '40px', justifyContent: 'center' }}>
                <div className="menu-item-container" onMouseEnter={(e) => handleEnter("course", e)} onMouseLeave={handleLeave} onMouseMove={handleMove}>
                  <p className="menu-text">COURSES</p>
                  <div className={`hover-preview ${preview.visible && preview.type === "course" ? "is-active" : ""}`}>
                    <img src={curveImage} alt="preview" className="preview-img" />
                    <div className="view-circle-btn" style={{ left: `${btnPos.x}%`, top: `${btnPos.y}%` }} onClick={handleViewClick1}>VIEW</div>
                  </div>
                </div>

                <div className="menu-item-container" onMouseEnter={(e) => handleEnter("events", e)} onMouseLeave={handleLeave} onMouseMove={handleMove}>
                  <p className="menu-text">EVENTS</p>
                  <div className={`hover-preview ${preview.visible && preview.type === "events" ? "is-active" : ""}`}>
                    <img src={curveImage} alt="preview" className="preview-img" />
                    <div className="view-circle-btn" style={{ left: `${btnPos.x}%`, top: `${btnPos.y}%` }} onClick={handleViewClick2}>VIEW</div>
                  </div>
                </div>
              </div>

              <div className="menu-row-bottom" style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                <div className="menu-item-container" onMouseEnter={(e) => handleEnter("placed", e)} onMouseLeave={handleLeave} onMouseMove={handleMove}>
                  <p className="menu-text">Placed Student</p>
                  <div className={`hover-preview ${preview.visible && preview.type === "placed" ? "is-active" : ""}`}>
                    <img src={curveImage} alt="preview" className="preview-img" />
                    <div className="view-circle-btn" style={{ left: `${btnPos.x}%`, top: `${btnPos.y}%` }} onClick={handleViewClick}>VIEW</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="center-stats">
              <span>100% Skills</span>
              <span className="equal">=</span>
              <span>100% Job</span>
            </div>
          </div>

          {/* LOGIN GLASS BOX */}
          <div className="login-box-glass">
            <div className="avatar-circle">
              <img src={avatar} alt="user" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <h2 className="welcome-stencil">WELCOME</h2>

            <form className="form-fields" onSubmit={handleLoginSubmit}>
              <div className="input-field">
                <label>Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@gmail.com"
                  required
                />
              </div>
              <div className="input-field">
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  required
                />
                <span className="forgot-pass" onClick={() => setShowForgot(true)} style={{ cursor: 'pointer' }}>
                  Forgot Password?
                </span>
              </div>
              <div className="button-stack">
                <button type="submit" className="btn-solid">LOGIN</button>

                <div className="google-btn-wrapper">
                  <div className="invisible-google-btn">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => console.log('Login Failed')}
                      width="100%"
                    />
                  </div>

                  <div className="custom-google-ui">
                    <svg width="20" height="20" viewBox="0 0 48 48">
                      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C40.483,35.54,44,30.145,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                    </svg>
                    <span style={{ fontWeight: 'bold', fontFamily: 'var(--oswald-font)' }}>
                      LOGIN WITH GOOGLE
                    </span>
                  </div>
                </div>

                <button type="button" className="btn-solid" onClick={onRegisterTrigger}>
                  REGISTER NOW
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* --- FORGOT PASSWORD MODAL (unchanged) --- */}
      {showForgot && (
        <div style={modalOverlayStyle}>
          <div className="login-box-glass" style={{ width: '380px', padding: '40px', position: 'relative' }}>
            <h2 className="welcome-stencil" style={{ fontSize: '22px', marginBottom: '20px' }}>RESET PASS</h2>

            {step === 1 && (
              <div className="form-fields">
                <div className="input-field">
                  <label>Registered Email</label>
                  <input type="email" placeholder="admin@gmail.com" onChange={(e) => setForgotEmail(e.target.value)} />
                </div>
                <button className="btn-solid" onClick={handleSendOTP} style={{ marginTop: '20px' }}>SEND OTP</button>
              </div>
            )}

            {step === 2 && (
              <div className="form-fields">
                <label>Enter 6-Digit OTP</label>
                <input type="text" onChange={(e) => setOtp(e.target.value)} />
                <button className="btn-solid" onClick={handleVerifyOTP}>VERIFY OTP</button>
              </div>
            )}

            {step === 3 && (
              <div className="form-fields">
                <div className="input-field">
                  <label>New Secure Password</label>
                  <input type="password" placeholder="********" onChange={(e) => setNewPassword(e.target.value)} />
                </div>
                <button className="btn-solid" onClick={handleResetSubmit} style={{ marginTop: '20px' }}>UPDATE PASSWORD</button>
              </div>
            )}

            <p
              onClick={() => { setShowForgot(false); setStep(1); }}
              style={{ color: '#a5d6a7', marginTop: '20px', cursor: 'pointer', fontSize: '14px', textAlign: 'center', fontWeight: 'bold' }}
            >
              ← BACK TO LOGIN
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const modalOverlayStyle = {
  position: 'fixed',
  top: 0, left: 0, width: '100%', height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.85)',
  display: 'flex', justifyContent: 'center', alignItems: 'center',
  zIndex: 10000,
  backdropFilter: 'blur(8px)'
};

export default Log_in;

