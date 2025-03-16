import React, { useState } from "react";
import UserDetails from "./UserDetails";
import AssignRobots from "./AssignRobots";

export default function User() {
  const [userActiveTab, setActiveTab] = useState(
    localStorage.getItem("userActiveTab") || "userDetails"
  );
  const switchTab = (tab) => {
    setActiveTab(tab);
    localStorage.setItem("userActiveTab", tab);
  };
  return (
    <div>
      <nav className="innerNav">
        <div
          className={userActiveTab === "userDetails" ? "active-tab" : ""}
          onClick={() => switchTab("userDetails")}
        >
          User Details
        </div>
        <div
          className={userActiveTab === "assignRobots" ? "active-tab" : ""}
          onClick={() => switchTab("assignRobots")}
        >
          Assign Robots To Users
        </div>
      </nav>
      <h1
        className="title"
        style={{ paddingLeft: "20px", marginBottom: "10px", marginTop: "15px" }}
      >
        {userActiveTab === "userDetails"
          ? "User Details"
          : "Assign Robots To Users"}
      </h1>
      <div className="content">
        {userActiveTab === "userDetails" ? <UserDetails /> : <AssignRobots />}
      </div>
    </div>
  );
}
