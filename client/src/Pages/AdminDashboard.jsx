import React, { useState } from "react";
import "../style/adminDashboard.css";
import UserDetails from "../Components/UserDetails";
import RobotRegistration from "../Components/Robot_registration";
import RobotControl from "../Components/RobotControl";

export default function AdminDashboard() {
  const [active, setActive] = useState("user");

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <div
          className={`icon-container ${active === "user" ? "active" : ""}`}
          onClick={() => setActive("user")}
        >
          <i class="fa-solid fa-user icon"></i>
          {active === "user" && <span className="dot"></span>}
        </div>
        <div
          className={`icon-container ${active === "robotRegistration" ? "active" : ""}`}
          onClick={() => setActive("robotRegistration")}
        >
          <i class="fa-solid fa-robot icon"></i>
          {active === "robotRegistration" && <span className="dot"></span>}
        </div>
        {/* Robot Control Icon */}
        <div
          className={`icon-container ${active === "robotControl" ? "active" : ""}`}
          onClick={() => setActive("robotControl")}
        >
          <i class="fa-solid fa-bars-progress icon"></i>
          {active === "robotControl" && <span className="dot"></span>}
        </div>
      </div>

      <div className="dashboard-content">
        {active === "user" && <UserDetails />}
        {active === "robotRegistration" && <RobotRegistration />}
        {active === "robotControl" && <RobotControl />}
      </div>
    </div>
  );
}