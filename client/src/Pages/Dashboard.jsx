import React, { useState, useEffect } from 'react';
import RobotTracking from '../Components/RobotTracking';
import Report from '../Components/Report'; // <-- Import Report

export default function Dashboard() {
  const [active, setActive] = useState(() => {
    return localStorage.getItem("activeTabDashboard") || "robotTracking";
  });

  useEffect(() => {
    localStorage.setItem("activeTabDashboard", active);
  }, [active]);

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        {/* Robot Tracking Tab */}
        <div
          className={`icon-container ${active === "robotTracking" ? "active" : ""}`}
          onClick={() => setActive("robotTracking")}
        >
          <i className="fa-solid fa-bars-progress icon"></i>
          {active === "robotTracking" && <span className="dot"></span>}
        </div>

        {/* Report Tab */}
        <div
          className={`icon-container ${active === "report" ? "active" : ""}`}
          onClick={() => setActive("report")}
        >
          <i className="fa-regular fa-rectangle-list icon"></i>
          {active === "report" && <span className="dot"></span>}
        </div>
      </div>

      <div className="dashboard-content">
        {active === "robotTracking" && <RobotTracking />}
        {active === "report" && <Report />} {/* Render Report */}
      </div>
    </div>
  );
}
