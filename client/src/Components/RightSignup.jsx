import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {signup} from '../api/api'
import "../style/login.css";

export default function RightSignup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("user");

  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const navigate = useNavigate();

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validateName = (name) => /^[A-Za-z ]{3,}$/.test(name);

  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);
    setNameError(validateName(value) ? "" : "Name must be at least 3 characters long and contain only letters and spaces");
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setEmailError(validateEmail(value) ? "" : "Invalid email address");
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordError(value.length >= 6 ? "" : "Password must be at least 6 characters long");
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    setConfirmPasswordError(value === password ? "" : "Passwords do not match");
  };

  const handleRoleChange = (e) => {
    setRole(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");

    let hasError = false;

    if (!name || !email || !password || !confirmPassword) {
      setMessage("All fields are required");
      setMessageType("error");
      hasError = true;
    }

    if (!validateName(name)) {
      setNameError("Name must be at least 3 characters long and contain only letters and spaces");
      hasError = true;
    }

    if (!validateEmail(email)) {
      setEmailError("Invalid email address");
      hasError = true;
    }

    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters long");
      hasError = true;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      hasError = true;
    }

    if (hasError) return;

    try {
      const response = await signup({name, email, password, role})

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Signup failed");
      }

      setMessage("Signup successful! Waiting for admin approval.");
      setMessageType("success");

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err) {
      setMessage(err.message);
      setMessageType("error");
    }
  };

  return (
    <div className="rightLogin">
      <h1 className="loginTitle">GUNI-SmartBotX</h1>
      <h3 className="loginWelcome">Welcome</h3>
      <form onSubmit={handleSubmit} className="loginForm">
        <div className={`inputWrapper ${nameError ? "error" : ""}`}>
          <input type="text" placeholder="Full Name" className="loginInput" value={name} onChange={handleNameChange} />
          {nameError && <div className="errorText">{nameError}</div>}
        </div>
        <div className={`inputWrapper ${emailError ? "error" : ""}`}>
          <input type="text" placeholder="Email address" className="loginInput" value={email} onChange={handleEmailChange} />
          {emailError && <div className="errorText">{emailError}</div>}
        </div>
        <div className={`inputWrapper ${passwordError ? "error" : ""}`}>
          <input type="password" placeholder="Password" className="loginInput" value={password} onChange={handlePasswordChange} />
          {passwordError && <div className="errorText">{passwordError}</div>}
        </div>
        <div className={`inputWrapper ${confirmPasswordError ? "error" : ""}`}>
          <input type="password" placeholder="Confirm Password" className="loginInput" value={confirmPassword} onChange={handleConfirmPasswordChange} />
          {confirmPasswordError && <div className="errorText">{confirmPasswordError}</div>}
        </div>
        <div className="inputWrapper">
          <select className="loginInput" value={role} onChange={handleRoleChange}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="submitButtonWrapper">
          <button className="loginButton">
            Request for Sign Up
          </button>
        </div>
        {message && <div className={`messageWrapper ${messageType} visible`}>{message}</div>}
      </form>
      <div className="signupPrompt">
        Already have an account? <Link to="/login" className="signupLink">Login here</Link>
      </div>
    </div>
  );
}
