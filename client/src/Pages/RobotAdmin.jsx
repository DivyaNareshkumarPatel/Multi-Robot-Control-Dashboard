import React, {useState, useEffect} from 'react'
import RobotTracking from '../Components/RobotTracking';

export default function RobotAdmin() {
  const [active, setActive] = useState(() => {
        return localStorage.getItem("activeTabAdminDashboard") || "robotTracking";
      });
    
      useEffect(() => {
        localStorage.setItem("activeTabAdminDashboard", active);
      }, [active]);
    return (
      <div className="dashboard-container">
            <div className="sidebar">
              <div
                className={`icon-container ${active === "robotTracking" ? "active" : ""}`}
                onClick={() => setActive("robotTracking")}
              >
                <i className="fa-solid fa-bars-progress icon"></i>
                {active === "robotTracking" && <span className="dot"></span>}
              </div>
            </div>
      
            <div className="dashboard-content">
              {active === "robotTracking" && <RobotTracking />}
            </div>
          </div>
    )
}
