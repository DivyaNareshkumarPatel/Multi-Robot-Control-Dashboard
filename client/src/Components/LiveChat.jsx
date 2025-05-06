import React, { useState } from 'react';
import LiveChatDashborad from './LiveChatDashborad'; // Placeholder for the live chat content
import Visitors from './Visitors'; // New Visitors component

export default function LiveChat() {
  const [userActiveTab, setActiveTab] = useState(
    localStorage.getItem("liveChatActiveTab") || "liveChatDashboard"
  );

  const switchTab = (tab) => {
    setActiveTab(tab);
    localStorage.setItem("liveChatActiveTab", tab);
  };

  return (
    <div>
      <nav className="innerNav">
        <div
          className={userActiveTab === "liveChatDashboard" ? "active-tab" : ""}
          onClick={() => switchTab("liveChatDashboard")}
        >
          Live Chat Dashboard
        </div>
        {/* <div
          className={userActiveTab === "visitors" ? "active-tab" : ""}
          onClick={() => switchTab("visitors")}
        >
          Visitors
        </div> */}
      </nav>

      <h1
        className="title"
        style={{ paddingLeft: "20px", marginBottom: "10px", marginTop: "15px" }}
      >
        {userActiveTab === "liveChatDashboard" ? "Live Chat Dashboard" : "Visitors"}
      </h1>

      <div className="content">
        {userActiveTab === "liveChatDashboard" ? <LiveChatDashborad /> : <Visitors />}
      </div>
    </div>
  );
}
