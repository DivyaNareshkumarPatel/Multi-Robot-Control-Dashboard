import React, { useState, useEffect } from "react";
import "../style/adminDashboard.css";
import UserDetails from "../Components/UserDetails";
import RobotRegistration from "../Components/Robot_registration";
import RobotTracking from "../Components/RobotTracking";

export default function AdminDashboard() {
  const [active, setActive] = useState(() => {
    return localStorage.getItem("activeTab") || "user";
  });

  useEffect(() => {
    localStorage.setItem("activeTab", active); // Store the active tab in localStorage whenever it changes
  }, [active]);

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <div
          className={`icon-container ${active === "user" ? "active" : ""}`}
          onClick={() => setActive("user")}
        >
          <i className="fa-solid fa-user icon"></i>
          {active === "user" && <span className="dot"></span>}
        </div>
        <div
          className={`icon-container ${active === "robotRegistration" ? "active" : ""}`}
          onClick={() => setActive("robotRegistration")}
        >
          <i className="fa-solid fa-robot icon"></i>
          {active === "robotRegistration" && <span className="dot"></span>}
        </div>
        <div
          className={`icon-container ${active === "robotTracking" ? "active" : ""}`}
          onClick={() => setActive("robotTracking")}
        >
          <i className="fa-solid fa-bars-progress icon"></i>
          {active === "robotTracking" && <span className="dot"></span>}
        </div>
      </div>

      <div className="dashboard-content">
        {active === "user" && <UserDetails />}
        {active === "robotRegistration" && <RobotRegistration />}
        {active === "robotTracking" && <RobotTracking />}
      </div>
    </div>
  );
}
