import React, { useEffect, useState } from "react";
import RobotControl from "./RobotControl";
import RobotVision from "./RobotVision";
import { getAllRobots, sendCommands, getRobotByEmail } from "../api/api";
import webSocketService from "../services/WebSocketService";

export default function RobotTracking() {
  const [logs, setLogs] = useState([]);
  const [selectedRobot, setSelectedRobot] = useState("");
  const [robots, setRobots] = useState([]);
  const [activeTab, setActiveTab] = useState(
    localStorage.getItem("RobotActiveTab") || "vision"
  );
  const [terminalHeight, setTerminalHeight] = useState(160);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const connectWebSocket = async () => {
      try {
        await webSocketService.connect();
        setIsConnected(true);
        addLog(`[WebSocket] Connected successfully`);
      } catch (error) {
        console.error("Failed to connect to WebSocket server:", error);
        setIsConnected(false);
        addLog(`[WebSocket] Connection failed, using API fallback`);
      }
    };

    connectWebSocket();
    return () => {
      webSocketService.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!isConnected) return;

    const robotListUnsubscribe = webSocketService.addRobotListListener(
      (wsRobots) => {
        addLog(
          `[WebSocket] Received list of ${wsRobots.length} connected robots`
        );
      }
    );

    const statusUnsubscribe = webSocketService.addStatusListener(
      (status, data) => {
        if (status === "disconnected") {
          setIsConnected(false);
          addLog(`[WebSocket] Disconnected, using API fallback`);
        } else if (status === "robot_update") {
          addLog(`[WebSocket] Robot ${data.robotId} ${data.status}`);
        } else if (status === "command_status") {
          addLog(
            `[WebSocket] Robot ${data.robotId} completed: ${data.command}`
          );
        }
      }
    );

    const messageUnsubscribe = webSocketService.addMessageListener(
      (message) => {
        if (message.type === "ack" || message.type === "error") {
          addLog(`[WebSocket] ${message.message || JSON.stringify(message)}`);
        }
      }
    );

    // Clean up listeners when component unmounts
    return () => {
      robotListUnsubscribe();
      statusUnsubscribe();
      messageUnsubscribe();
    };
  }, [isConnected]);

  // Load robots from database
  useEffect(() => {
    fetchRobots();
  }, []);

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
      if (response.data.length > 0 && !selectedRobot) {
        setSelectedRobot(response.data[0].robotId);
      }
    } catch (error) {
      console.error("Error fetching robots:", error);
      addLog(`[Error] Failed to fetch robots from database`);
    }
  };

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prevLogs) => [`[${timestamp}] ${message}`, ...prevLogs]);
  };

  const handleCommand = async (command) => {
    if (!selectedRobot) {
      addLog(`[Error] Please select a robot first`);
      return;
    }

    addLog(`> [Robot ${selectedRobot}] ${command}`);

    try {
      if (isConnected) {
        const sent = webSocketService.sendCommand(selectedRobot, command);
        if (!sent) {
          addLog(`[WebSocket] Not ready, falling back to API`);
          await sendViaAPI(selectedRobot, command);
        } else {
          addLog(`[WebSocket] Command sent to robot ${selectedRobot}`);
        }
      } else {
        await sendViaAPI(selectedRobot, command);
      }
    } catch (error) {
      console.error("Error sending command:", error);
      addLog(`[Error] Failed to send command: ${error.message}`);
    }
  };

  // Send command via API
  const sendViaAPI = async (robotId, command) => {
    try {
      const response = await sendCommands({ robotId, command });
      if (response.status === 200) {
        addLog(`[API] Command sent to ${robotId}`);
      } else {
        addLog(
          `[API Error] ${response.data?.message || "Failed to send command"}`
        );
      }
    } catch (error) {
      console.error("API command error:", error);
      addLog(`[API Error] ${error.message}`);
    }
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    localStorage.setItem("RobotActiveTab", tab);
  };

  return (
    <div
      className="robot-tracking"
      style={{
        overflow: "scroll",
        height: "100%",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
    >
      <nav className="innerNav">
        <div
          className={activeTab === "vision" ? "active-tab" : ""}
          onClick={() => switchTab("vision")}
        >
          Robot Vision and Mapping
        </div>
        <div
          className={activeTab === "control-tab" ? "active-tab" : ""}
          onClick={() => switchTab("control-tab")}
        >
          Robot Control Panel
        </div>
      </nav>

      <h1
        className="title"
        style={{ paddingLeft: "20px", marginBottom: "10px", marginTop: "15px" }}
      >
        {activeTab === "vision"
          ? "Robot Vision and Mapping"
          : "Robot Control Panel"}
      </h1>

      <div
        className={`connection-indicator ${
          isConnected ? "connected" : "disconnected"
        }`}
        style={{ margin: "0 20px 10px" }}
      >
        {isConnected ? "WebSocket Connected ✓" : "WebSocket Disconnected ✗"}
      </div>

      <div className="robot-selector" style={{ paddingLeft: "20px" }}>
        <label>Select Robot:</label>
        <select
          className="robot-dropdown"
          value={selectedRobot}
          onChange={(e) => setSelectedRobot(e.target.value)}
        >
          {robots.length > 0 ? (
            robots.map((robot) => (
              <option key={robot._id} value={robot.robotId}>
                {robot.robotName || robot.robotId}{" "}
                {isConnected ? "- WebSocket Available" : ""}
              </option>
            ))
          ) : (
            <option disabled>Loading Robots...</option>
          )}
        </select>
      </div>

      <div
        className="content"
        style={{
          height: `calc(100vh - ${terminalHeight + 240}px)`,
          overflowY: "scroll",
        }}
      >
        {activeTab === "vision" ? (
          <RobotVision />
        ) : (
          <RobotControl
            selectedRobot={selectedRobot}
            onSendCommand={handleCommand}
          />
        )}
      </div>

      <div
        className="control-terminal"
        style={{ height: `${terminalHeight}px`, maxHeight: "99vh" }}
      >
        <div
          className="resize-handle"
          onMouseDown={(e) => {
            const startY = e.clientY;
            const startHeight = terminalHeight;

            const onMouseMove = (event) => {
              const newHeight = Math.max(
                35,
                Math.min(
                  (99 * window.innerHeight) / 100,
                  startHeight - (event.clientY - startY)
                )
              );
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
          <i className="fa-solid fa-grip-lines drag-icon" style={{color:"black"}}></i>
        </div>

        <div className="log-container">
          {logs.length > 0 ? (
            logs.map((log, index) => <p key={index}>{log}</p>)
          ) : (
            <p>No commands yet...</p>
          )}
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
