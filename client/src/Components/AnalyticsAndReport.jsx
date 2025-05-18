import React, { useState, useEffect } from "react";
import CircularGraph from "./CircularGraph";
import RobotData from "./RobotData";
import {
  getAllRobots,
  getRobotByEmail,
  getCommandHistory,
  getAnalytics,
  getAllChats,
} from "../api/api";

export default function AnalyticsAndReport() {
  const [robots, setRobots] = useState([]);
  const [selectedRobot, setSelectedRobot] = useState("");
  const [analyticsData, setAnalyticsData] = useState({
    battery: 0,
    cpuUsage: 0,
    ramUsage: 0,
    ipadBattery: 0,
    totalTaskCompleted: 0,
    totalTaskCompletedToday: 0,
    totalConversations: 0,
    totalConversationsToday: 0,
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

      const uniqueRobots = Array.from(
        new Map(response.data.map((item) => [item.robotId, item])).values()
      );

      setRobots(uniqueRobots);

      if (uniqueRobots.length > 0) {
        setSelectedRobot(uniqueRobots[0].robotId);
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching robots:", error);
      setIsLoading(false);
    }
  };

  const isTodayUTC = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    return (
      date.getUTCFullYear() === now.getUTCFullYear() &&
      date.getUTCMonth() === now.getUTCMonth() &&
      date.getUTCDate() === now.getUTCDate()
    );
  };

  const fetchRobotData = async () => {
    try {
      const robotId = selectedRobot;
      const commandHistoryResponse = await getCommandHistory(robotId);
      const commandHistory = commandHistoryResponse.data || [];

      const totalTaskCompleted = commandHistory.filter(
        (cmd) => cmd.status === "completed"
      ).length;

      const totalTaskCompletedToday = commandHistory.filter((cmd) => {
        const cmdDate = new Date(cmd.createdAt);
        return (
          cmd.status === "completed" &&
          isTodayUTC(cmd.createdAt)
        );
      }).length;

      const chatResponse = await getAllChats();
      const allChats = chatResponse.data || [];

      const conversationChats = allChats.filter((chat) =>
        chat.messages?.some((msg) => msg.text?.includes(robotId))
      );

      const totalConversations = conversationChats.length;

      const totalConversationsToday = conversationChats.filter((chat) => {
        if (!chat.createdAt) return false;
        console.log(isTodayUTC(chat.createdAt))
        return isTodayUTC(chat.createdAt);
      }).length;

      const analyticsResponse = await getAnalytics(robotId);
      const analyticsList = analyticsResponse?.data?.data || [];
      const latestAnalytics = analyticsList[0] || {};

      setAnalyticsData({
        battery: latestAnalytics.battery ?? 0,
        cpuUsage: latestAnalytics.cpuUsage ?? 0,
        ramUsage: latestAnalytics.ramUsage ?? 0,
        ipadBattery: latestAnalytics.ipadBattery ?? 0,
        totalTaskCompleted,
        totalTaskCompletedToday,
        totalConversations,
        totalConversationsToday,
      });
    } catch (error) {
      console.error("Error fetching robot data:", error);
    }
  };

  if (isLoading) {
    return <div>Loading robot data...</div>;
  }

  return (
    <div
      style={{
        background: "rgb(244, 244, 244)",
        paddingTop: "0.5px",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div className="robot-selector" style={{ margin: "20px" }}>
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
            <option key={robot.robotId} value={robot.robotId}>
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
          flexWrap: "wrap",
        }}
      >
        <CircularGraph level={analyticsData.battery} heading="Battery" />
        <CircularGraph level={analyticsData.cpuUsage} heading="CPU Usage" />
        <CircularGraph level={analyticsData.ramUsage} heading="RAM Usage" />
        <CircularGraph level={analyticsData.ipadBattery} heading="iPad Battery" />
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          margin: "20px",
          flexWrap: "wrap",
        }}
      >
        <RobotData heading="Total Task Completed" data={analyticsData.totalTaskCompleted} />
        <RobotData heading="Total Task Completed Today" data={analyticsData.totalTaskCompletedToday} />
        <RobotData heading="Total Conversations" data={analyticsData.totalConversations} />
        {/* <RobotData heading="Total Conversations Today" data={analyticsData.totalConversationsToday} /> */}
      </div>
    </div>
  );
}
