import React, { useState, useEffect } from "react";
import { getAllRobots, sendCommands } from "../api/api";
import "../style/robotControl.css";

export default function RobotControl() {
  const [logs, setLogs] = useState([]);
  const [selectedRobot, setSelectedRobot] = useState("");
  const [robots, setRobots] = useState([]);

  useEffect(() => {
    const fetchRobots = async () => {
      try {
        const response = await getAllRobots();
        setRobots(response.data);
        if (response.data.length > 0) {
          setSelectedRobot(response.data[0].robotId); // Ensure robotId is correct
        }
      } catch (error) {
        console.error("Error fetching robots:", error);
      }
    };

    fetchRobots();
  }, []);

  const handleCommand = async (command) => {
    if (!selectedRobot) {
      alert("Please select a robot first.");
      return;
    }

    setLogs((prevLogs) => [`> [Robot ${selectedRobot}] ${command}`, ...prevLogs]);

    try {
      await sendCommands({ robotId: selectedRobot, command });
    } catch (error) {
      console.error("Error sending command:", error);
    }
  };

  return (
    <div className="robot-container">
      <h1 className="title">Robot Control Panel</h1>

      <div className="robot-selector">
        <label>Select Robot:</label>
        <select
          className="robot-dropdown"
          value={selectedRobot}
          onChange={(e) => setSelectedRobot(e.target.value)}
        >
          {robots.length > 0 ? (
            robots.map((robot, index) => (
              <option key={robot.robotId || index} value={robot.robotId}>
                {`${robot.robotId}`}
              </option>
            ))
          ) : (
            <option disabled>Loading Robots...</option>
          )}
        </select>
      </div>

      <div className="grid-controls">
        <button className="control-btn" onClick={() => handleCommand("Move Forward")}>
          Forward
        </button>
        <button className="control-btn" onClick={() => handleCommand("Move Left")}>
          Left
        </button>
        <button className="control-btn stop-btn" onClick={() => handleCommand("Stop")}>
          Stop
        </button>
        <button className="control-btn" onClick={() => handleCommand("Move Right")}>
          Right
        </button>
        <button className="control-btn" onClick={() => handleCommand("Move Backward")}>
          Backward
        </button>
        <button className="control-btn" onClick={() => handleCommand("Rotate Left")}>
          Rotate Left
        </button>
        <button className="control-btn" onClick={() => handleCommand("Rotate Right")}>
          Rotate Right
        </button>
        <button className="control-btn speed-up" onClick={() => handleCommand("Speed Up")}>
          Speed Up
        </button>
        <button className="control-btn slow-down" onClick={() => handleCommand("Slow Down")}>
          Slow Down
        </button>
      </div>

      <div className="control-terminal">
        <div className="log-container">
          {logs.length > 0 ? logs.map((log, index) => <p key={index}>{log}</p>) : <p>No commands yet...</p>}
        </div>
      </div>
    </div>
  );
}
