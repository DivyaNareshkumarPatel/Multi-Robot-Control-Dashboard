import React, { useState, useEffect } from "react";
import CircularGraph from "./CircularGraph";
import RobotData from "./RobotData";
import { getAllRobots, getRobotByEmail, getCommandHistory } from "../api/api";

export default function AnalyticsAndReport() {
  const [robots, setRobots] = useState([]);
  const [selectedRobot, setSelectedRobot] = useState("");
  const [analyticsData, setAnalyticsData] = useState({
    battery: 30,
    cpuUsage: 80,
    ramUsage: 70,
    ipadBattery: 50,
    distance: "1000m",
    totalUptime: "120 mins",
    totalTaskCompleted: 100,
    totalTaskCompletedToday: 10,
    totalInteractions: 10,
    totalConversations: 50,
    totalConversationsToday: 5,
    averageConversationTime: "50 mins",
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRobots();
  }, []);

  useEffect(() => {
    if (selectedRobot) {
      fetchRobotData();
    }
  }, [selectedRobot]);

  const fetchRobots = async () => {
    try {
      const userRole = localStorage.getItem("role");
      const userEmail = localStorage.getItem("email");

      let response;
      if (userRole === "admin") {
        response = await getAllRobots();
      } else {
        response = await getRobotByEmail(userEmail);
      }

      setRobots(response.data);
      if (response.data.length > 0) {
        setSelectedRobot(response.data[0].robotId);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching robots:", error);
      setIsLoading(false);
    }
  };

  const fetchRobotData = async () => {
    try {
      const robotIndex = robots.findIndex(
        (robot) => robot.robotId === selectedRobot
      );

      const commandHistoryResponse = await getCommandHistory(selectedRobot);
      const commandHistory = commandHistoryResponse.data || [];

      const totalCommands = commandHistory.length;
      const todayCommands = commandHistory.filter((cmd) => {
        const cmdDate = new Date(cmd.createdAt);
        const today = new Date();
        return cmdDate.toDateString() === today.toDateString();
      }).length;

      setAnalyticsData({
        battery: 30 + ((robotIndex * 5) % 70),
        cpuUsage: 50 + ((robotIndex * 7) % 50),
        ramUsage: 40 + ((robotIndex * 10) % 60),
        ipadBattery: 50 + ((robotIndex * 3) % 50),
        distance: `${800 + robotIndex * 200}m`,
        totalUptime: `${100 + robotIndex * 20} mins`,
        totalTaskCompleted: totalCommands || 80 + robotIndex * 10,
        totalTaskCompletedToday: todayCommands || 5 + robotIndex * 2,
        totalInteractions: 8 + robotIndex * 3,
        totalConversations: 40 + robotIndex * 5,
        totalConversationsToday: 3 + robotIndex * 1,
        averageConversationTime: `${45 + robotIndex * 5} mins`,
      });
    } catch (error) {
      console.error("Error fetching robot data:", error);
    }
  };

  if (isLoading) {
    return <div>Loading robot data...</div>;
  }

  return (
    <div style={{background:"rgb(244, 244, 244)" , paddingTop:"0.5px"}}>
      <div className="robot-selector" style={{ margin: "20px"}}>
        <label>Select Robot: </label>
        <select
          value={selectedRobot}
          onChange={(e) => setSelectedRobot(e.target.value)}
          style={{
            backgroundColor: "#ffffff",
            color: "black",
            border: "1px solid #444",
            padding: "8px 12px",
            fontSize: "14px",
            borderRadius: "5px",
            cursor: "pointer",
            width: "300px",
            marginLeft: "10px",
          }}
        >
          {robots.map((robot) => (
            <option key={robot._id} value={robot.robotId}>
              {robot.robotName || robot.robotId}
            </option>
          ))}
        </select>
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
          <CircularGraph
            level={analyticsData.battery}
            heading="Battery"
          ></CircularGraph>
        </div>
        <div>
          <CircularGraph
            level={analyticsData.cpuUsage}
            heading="CPU Usage"
          ></CircularGraph>
        </div>
        <div>
          <CircularGraph
            level={analyticsData.ramUsage}
            heading="RAM Usage"
          ></CircularGraph>
        </div>
        <div>
          <CircularGraph
            level={analyticsData.ipadBattery}
            heading="Ipad Battery"
          ></CircularGraph>
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
            heading="Distance"
            data={analyticsData.distance}
          ></RobotData>
        </div>
        <div>
          <RobotData
            heading="Total Uptime"
            data={analyticsData.totalUptime}
          ></RobotData>
        </div>
        <div>
          <RobotData
            heading="Total Task Completed"
            data={analyticsData.totalTaskCompleted}
          ></RobotData>
        </div>
        <div>
          <RobotData
            heading="Total Task Completed Today"
            data={analyticsData.totalTaskCompletedToday}
          ></RobotData>
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
            data={analyticsData.totalInteractions}
          ></RobotData>
        </div>
        <div>
          <RobotData
            heading="Total Conversations"
            data={analyticsData.totalConversations}
          ></RobotData>
        </div>
        <div>
          <RobotData
            heading="Total Conversations Today"
            data={analyticsData.totalConversationsToday}
          ></RobotData>
        </div>
        <div>
          <RobotData
            heading="Average Conversation time"
            data={analyticsData.averageConversationTime}
          ></RobotData>
        </div>
      </div>
    </div>
  );
}
