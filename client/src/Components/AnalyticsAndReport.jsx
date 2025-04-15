import React from "react";
import CircularGraph from "./CircularGraph";
import RobotData from "./RobotData";
export default function AnalyticsAndReport() {
  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          margin: "20px",
        }}
      >
        <div>
          <CircularGraph level={30} heading="Battery"></CircularGraph>
        </div>
        <div>
          <CircularGraph level={80} heading="CPU Usage"></CircularGraph>
        </div>
        <div>
          <CircularGraph level={70} heading="RAM Usage"></CircularGraph>
        </div>
        <div>
          <CircularGraph level={50} heading="Ipad Battery"></CircularGraph>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          margin: "20px",
        }}
      >
        <div>
          <RobotData heading="Distance" data="1000m"></RobotData>
        </div>
        <div>
          <RobotData heading="Total Uptime" data="120 mins"></RobotData>
        </div>
        <div>
          <RobotData heading="Total Task Completed" data="100"></RobotData>
        </div>
        <div>
          <RobotData heading="Total Task Completed Today" data="10"></RobotData>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          margin: "20px",
        }}
      >
        <div>
          <RobotData
            heading="Total interactions with people"
            data="10"
          ></RobotData>
        </div>
        <div>
          <RobotData heading="Total Conversations" data="50"></RobotData>
        </div>
        <div>
          <RobotData heading="Total Conversations Today" data="5"></RobotData>
        </div>
        <div>
          <RobotData heading="Average Conversation time" data="50 mins"></RobotData>
        </div>
      </div>
    </div>
  );
}
