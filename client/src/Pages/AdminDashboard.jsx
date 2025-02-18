import React, { useState } from "react";
import { User } from "lucide-react";
import "../style/adminDashboard.css";
import UserDetails from "../Components/UserDetails";

export default function AdminDashboard() {
  const [active, setActive] = useState("user");

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <div
          className={`icon-container ${active === "user" ? "active" : ""}`}
          onClick={() => setActive("user")}
        >
          <User className="icon" />
          {active === "user" && <span className="dot"></span>}
        </div>
      </div>
      
      <UserDetails/>
    </div>
  );
}
