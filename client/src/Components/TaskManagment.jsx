import React, { useState, useEffect } from "react";
import BarGraph from "./BarGraph";
import BarGraphHorizontal from "./BarGraphHorizontal";
import CommandHistory from "./CommandHistory";
import { getAllRobots, getRobotByEmail, getCommandHistory } from "../api/api";

export default function TaskManagment() {
  const [robots, setRobots] = useState([]);
  const [selectedRobot, setSelectedRobot] = useState("");
  const [commandLogs, setCommandLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch available robots
  useEffect(() => {
    fetchRobots();
  }, []);

  // Fetch robot-specific data whenever selected robot changes
  useEffect(() => {
    if (selectedRobot) {
      fetchCommandHistory();
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

  const fetchCommandHistory = async () => {
    try {
      const response = await getCommandHistory(selectedRobot);
      
      if (response && response.data) {
        // Format the command history for the CommandHistory component
        const formattedLogs = response.data.map((cmd, index) => ({
          id: cmd._id || index,
          command: cmd.command,
          status: cmd.status || 'completed',
          response: cmd.response || `Robot ${selectedRobot} executed "${cmd.command}" successfully`,
          time: new Date(cmd.createdAt).toLocaleTimeString()
        }));
        
        setCommandLogs(formattedLogs);
      }
    } catch (error) {
      console.error("Error fetching command history:", error);
    }
  };

  if (isLoading) {
    return <div>Loading task data...</div>;
  }

  return (
    <div style={{
      overflow: "scroll",
      height: "100vh",
      scrollbarWidth: "none",
      msOverflowStyle: "none",
    }}>
      <div>
        <div className="robot-selector" style={{ margin: "20px" }}>
          <label>Select Robot: </label>
          <select 
            value={selectedRobot} 
            onChange={(e) => setSelectedRobot(e.target.value)}
            style={{
              backgroundColor: "#252526",
              color: "#ffffff",
              border: "1px solid #444",
              padding: "8px 12px",
              fontSize: "14px",
              borderRadius: "5px",
              cursor: "pointer",
              width: "300px",
              marginLeft: "10px"
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
          <BarGraph robotId={selectedRobot} />
          <BarGraphHorizontal robotId={selectedRobot} />
        </div>
        <div>
          <CommandHistory robotId={selectedRobot} commandLogs={commandLogs} />
        </div>
      </div>
    </div>
  );
}
