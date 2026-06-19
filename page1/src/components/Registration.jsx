import React, { useState, useEffect } from 'react';
import '../styles/Registration.css';

// Assets imports
import curveImage from "../assets/Rectangle.png";
import lamp from "../assets/lamp.png";
import yellowBlob1 from "../assets/reg-Rectangle 1.svg";
import yellowBlob2 from "../assets/reg-Rectangle 6.svg";
import logo from "../assets/fc-logo.png";
import avatar from "../assets/avatar.png";

const Registration = ({ onLoginTrigger }) => {
  const [showContent, setShowContent] = useState(false);
  
  const initialFormState = {
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    contact: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    // Content ko 0.5s ke baad fade-in karenge taaki transition ke baad dikhe
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 500); 
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    if (name === 'fullName') {
      processedValue = value.toUpperCase();
    } else if (name === 'email') {
      processedValue = value.toLowerCase();
    }

    setFormData({
      ...formData,
      [name]: processedValue
    });
  };

  // Registration.jsx mein handleSubmit ke andar ye change karein:

const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ 1. Confirm Password Validation
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    // 2. Contact Validation (Indian number only)
    const indianMobileRegex = /^[6-9]\d{9}$/;
    if (!indianMobileRegex.test(formData.contact)) {
      alert("Invalid Indian mobile number!");
      return;
    }


  try {
    const response = await fetch("http://localhost:5001/api/register", { 
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (response.ok) {
      alert("REGISTRATION SUCCESSFUL!");
      setFormData(initialFormState);
      onLoginTrigger(); 
    } else {
      alert(data.message || data.error || "Something went wrong");
      setFormData(initialFormState);
    }
  } catch {
    alert("Backend is not Connected");
    setFormData(initialFormState);
  }
};
  return (
    <div className={`reg-layout-wrapper ${showContent ? 'fade-in' : 'hide-content'}`}> 
      <div className="reg-container-main"> 
        <div className="reg-green-bg"> 
          <img src={lamp} className="reg-lamp-top" alt="lamp" />
          <div className="reg-logo">
            <img src={logo} alt="Fortune Cloud Logo" />
          </div>
          
          <img src={yellowBlob1} className="reg-yellow-shape-1" alt="" />
          <img src={yellowBlob2} className="reg-yellow-shape-2" alt="" />
          <img src={curveImage} className="reg-student-img" alt="design-curve" />

          <div className="reg-main-title">
            <span>JOIN FORTUNE CLOUD <span className="reg-subhead"> NOW </span></span>
          </div>

          <div className="reg-center-stats-wrapper">
            <div className="reg-center-stats">
              <span>Start Journey</span>
              <span className="reg-equal">★</span>
              <span>Build Future</span>
            </div>
          </div>

          <div className="reg-box-glass">
            <div className="reg-avatar-circle">
              <img src={avatar} alt="user" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <h2 className="reg-welcome-stencil">REGISTER</h2>
            
            <form className="reg-form-fields" onSubmit={handleSubmit}>
              <div className="reg-input-field">
                <label htmlFor="fullName">FULL NAME</label>
                <input 
                  type="text" 
                  id="fullName"
                  name="fullName"
                  placeholder="ENTER NAME" 
                  value={formData.fullName}
                  onChange={handleChange}
                  autoFocus 
                  required 
                />
              </div>
              
              <div className="reg-input-field">
                <label htmlFor="email">EMAIL ADDRESS</label>
                <input 
                  type="email" 
                  id="email"
                  name="email"
                  placeholder="example@gmail.com" 
                  value={formData.email}
                  onChange={handleChange}
                  required 
                />
              </div>

              <div className="reg-input-field">
                <label htmlFor="password">PASSWORD</label>
                <input 
                  type="password" 
                  id="password"
                  name="password"
                  placeholder="MIN 8 CHARACTERS" 
                  value={formData.password}
                  onChange={handleChange}
                  required 
                />
              </div>

                   <div className="reg-input-field">
                <label htmlFor="confirmPassword">CONFIRM PASSWORD</label>
                <input 
                  type="password" 
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="RE-ENTER PASSWORD" 
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required 
                />
              </div>

              <div className="reg-input-field">
                <label htmlFor="contact">CONTACT NO</label>
                <input 
                  type="tel" 
                  id="contact"
                  name="contact"
                  placeholder="10 DIGIT NUMBER" 
                  value={formData.contact}
                  onChange={handleChange}
                  maxLength="10" 
                  required 
                />
              </div>

              <div className="reg-button-stack">
                <button type="submit" className="reg-btn-solid">SUBMIT NOW</button>
                <p className="reg-login-link" onClick={onLoginTrigger} style={{cursor: 'pointer'}}>
                  ALREADY HAVE AN ACCOUNT? LOGIN
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Registration;
