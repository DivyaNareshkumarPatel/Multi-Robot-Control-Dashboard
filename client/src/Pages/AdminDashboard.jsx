import React, { useState, useEffect } from "react";
import "../style/adminDashboard.css";
import User from "../Components/User";
import RobotRegistration from "../Components/Robot_registration";
import RobotTracking from "../Components/RobotTracking";
import Report from "../Components/Report";
import LiveChat from "../Components/LiveChat";

export default function AdminDashboard() {
  const [active, setActive] = useState(() => {
    return localStorage.getItem("activeTab") || "user";
  });

  useEffect(() => {
    localStorage.setItem("activeTab", active);
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
        <div
          className={`icon-container ${active === "report" ? "active" : ""}`}
          onClick={() => setActive("report")}
        >
          <i className="fa-regular fa-rectangle-list icon"></i>
          {active === "report" && <span className="dot"></span>}
        </div>
        <div
          className={`icon-container ${active === "liveChat" ? "active" : ""}`}
          onClick={() => setActive("liveChat")}
        >
          <i className="fa-solid fa-comment icon"></i>
          {active === "liveChat" && <span className="dot"></span>}
        </div>
      </div>

      <div className="dashboard-content">
        {active === "user" && <User />}
        {active === "robotRegistration" && <RobotRegistration />}
        {active === "robotTracking" && <RobotTracking />}
        {active === "report" && <Report />}
        {active === "liveChat" && <LiveChat />}
      </div>
    </div>
  );
}
