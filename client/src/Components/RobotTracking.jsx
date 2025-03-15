import React, { useEffect, useState } from "react";
import RobotControl from "./RobotControl";
import RobotVision from "./RobotVision";
import { getAllRobots, sendCommands } from "../api/api";

export default function RobotTracking() {
  const [logs, setLogs] = useState([]);
  const [selectedRobot, setSelectedRobot] = useState("");
  const [robots, setRobots] = useState([]);
  const [activeTab, setActiveTab] = useState(localStorage.getItem("RobotActiveTab") || "vision");
  const [terminalHeight, setTerminalHeight] = useState(160);

  useEffect(() => {
    fetchRobots();
  }, []);
  const fetchRobots = async () => {
    try {
      const response = await getAllRobots();
      setRobots(response.data);
      if (response.data.length > 0 && !selectedRobot) {
        setSelectedRobot(response.data[0].robotId);
      }
    } catch (error) {
      console.error("Error fetching robots:", error);
    }
  };

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

  const switchTab = (tab) => {
    setActiveTab(tab);
    localStorage.setItem("RobotActiveTab", tab);
  };

  return (
    <div className="robot-tracking">
      <nav className="innerNav">
        <div className={activeTab === "vision" ? "active-tab" : ""} onClick={() => switchTab("vision")}>
          Robot Vision and Mapping
        </div>
        <div className={activeTab === "control-tab" ? "active-tab" : ""} onClick={() => switchTab("control-tab")}>
          Robot Control Panel
        </div>
      </nav>

      <h1 className="title" style={{ paddingLeft: "20px", marginBottom: "10px", marginTop: "15px" }}>
        {activeTab === "vision" ? "Robot Vision and Mapping" : "Robot Control Panel"}
      </h1>

      <div className="robot-selector" style={{ paddingLeft: "20px" }}>
        <label>Select Robot:</label>
        <select className="robot-dropdown" value={selectedRobot} onChange={(e) => setSelectedRobot(e.target.value)}>
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

      <div className="content" style={{ height: `calc(100vh - ${terminalHeight + 160}px)`, overflowY:"scroll" }}>
        {activeTab === "vision" ? <RobotVision /> : <RobotControl />}
      </div>

      <div className="control-terminal" style={{ height: `${terminalHeight}px`, maxHeight: "99vh" }}>
        <div
          className="resize-handle"
          onMouseDown={(e) => {
            const startY = e.clientY;
            const startHeight = terminalHeight;

            const onMouseMove = (event) => {
              const newHeight = Math.max(35, Math.min(99 * window.innerHeight / 100, startHeight - (event.clientY - startY)));
              setTerminalHeight(newHeight);
            };

            const onMouseUp = () => {
              window.removeEventListener("mousemove", onMouseMove);
              window.removeEventListener("mouseup", onMouseUp);
            };

            window.addEventListener("mousemove", onMouseMove);
            window.addEventListener("mouseup", onMouseUp);
          }}
        >
          <i className="fa-solid fa-grip-lines drag-icon"></i>
        </div>

        <div className="log-container">
          {logs.length > 0 ? logs.map((log, index) => <p key={index}>{log}</p>) : <p>No commands yet...</p>}
        </div>
      </div>

      <style jsx>{`
        .resize-handle {
          cursor: ns-resize;
          text-align: center;
          padding: 5px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .drag-icon {
          font-size: 10px;
          color: white;
        }
      `}</style>
    </div>
  );
}
