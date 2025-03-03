import React, { useState } from "react";
import { User, Cpu } from "lucide-react"; // Using the Cpu icon instead of Robot
import "../style/adminDashboard.css";
import UserDetails from "../Components/UserDetails";
import RobotRegistration from "../Components/Robot_registration";

export default function AdminDashboard() {
  const [active, setActive] = useState("user");

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        {/* User Icon */}
        <div
          className={`icon-container ${active === "user" ? "active" : ""}`}
          onClick={() => setActive("user")}
        >
          <User className="icon" />
          {active === "user" && <span className="dot"></span>}
        </div>
        {/* Robot Icon (Replaced with Cpu) */}
        <div
          className={`icon-container ${active === "robot" ? "active" : ""}`}
          onClick={() => setActive("robot")}
        >
          <Cpu className="icon" />
          {active === "robot" && <span className="dot"></span>}
        </div>
      </div>

      <div className="dashboard-content">
        {active === "user" ? <UserDetails /> : <RobotRegistration />}
      </div>
    </div>
  );
}
