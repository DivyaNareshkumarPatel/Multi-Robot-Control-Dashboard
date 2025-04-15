import React, {useState} from 'react'
import AnalyticsAndReport from './AnalyticsAndReport'
import TaskManagment from './TaskManagment'

export default function Report() {
  const [userActiveTab, setActiveTab] = useState(
      localStorage.getItem("reportActiveTab") || "analytics"
    );
    const switchTab = (tab) => {
      setActiveTab(tab);
      localStorage.setItem("reportActiveTab", tab);
    };
    return (
      <div>
        <nav className="innerNav">
          <div
            className={userActiveTab === "analytics" ? "active-tab" : ""}
            onClick={() => switchTab("analytics")}
          >
            Analytics and Report
          </div>
          <div
            className={userActiveTab === "taskManagment" ? "active-tab" : ""}
            onClick={() => switchTab("taskManagment")}
          >
            Task Managment
          </div>
        </nav>
        <h1
          className="title"
          style={{ paddingLeft: "20px", marginBottom: "10px", marginTop: "15px" }}
        >
          {userActiveTab === "analytics"
            ? "Analytics and Report"
            : "Task Managment"}
        </h1>
        <div className="content">
          {userActiveTab === "analytics" ? <AnalyticsAndReport /> : <TaskManagment />}
        </div>
      </div>
    );
}
