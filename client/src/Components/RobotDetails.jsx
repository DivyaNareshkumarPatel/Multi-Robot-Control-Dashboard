import React, { useState, useEffect } from "react";
import { getAllRobots, deleteRobot, updateRobot } from "../api/api";
import "../style/adminDashboard.css";
import "../style/robotControl.css";

export default function RobotDetails() {
  const [robots, setRobots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editRobot, setEditRobot] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [robotData, setRobotData] = useState({
    robotName: "",
    robotId: "",
    ram: "",
    cpu: "",
    rom: "",
    manufacturer: "",
    yearOfManufacture: "",
    apikey: "",
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchRobots = async () => {
      try {
        const response = await getAllRobots();
        setRobots(response.data);
        setLoading(false);
      } catch (err) {
        setError("Error fetching robots");
        setLoading(false);
      }
    };
    fetchRobots();
  }, []);

  const handleEdit = (robot) => {
    setEditRobot(robot._id);
    setRobotData({ ...robot });
    setValidationError(null);
  };

  const handleUpdate = async () => {
    const isDuplicateId = robots.some(
      (robot) => robot.robotId === robotData.robotId && robot._id !== editRobot
    );

    if (isDuplicateId) {
      setValidationError("Robot ID already exists!");
      return;
    }

    try {
      await updateRobot(editRobot, robotData);
      setRobots(
        robots.map((robot) =>
          robot._id === editRobot ? { ...robot, ...robotData } : robot
        )
      );
      setEditRobot(null);
      setValidationError(null);
    } catch (err) {
      setError("Error updating robot");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteRobot(id);
      setRobots(robots.filter((robot) => robot._id !== id));
    } catch (err) {
      setError("Error deleting robot");
    }
  };

  return (
    <div
      className="dashboard-content dashboard-content-robo"
      style={{ marginLeft: "40px" }}
    >
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <div className="table-container robot-table">
          {validationError && (
            <div className={`messageWrapper error visible`}>
              {validationError}
            </div>
          )}
          <table className="user-table">
            <thead>
              <tr>
                <th>Robot Name</th>
                <th>Robot ID</th>
                <th>RAM (GB)</th>
                <th>CPU</th>
                <th>ROM (GB)</th>
                <th>Manufacturer</th>
                <th>Year of Manufacture</th>
                <th>API Key</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {robots.map((robot) => (
                <tr key={robot._id}>
                  <td>
                    {robot._id === editRobot ? (
                      <input
                        type="text"
                        value={robotData.robotName}
                        onChange={(e) =>
                          setRobotData({
                            ...robotData,
                            robotName: e.target.value,
                          })
                        }
                      />
                    ) : (
                      robot.robotName
                    )}
                  </td>
                  <td>
                    {robot._id === editRobot ? (
                      <input
                        type="text"
                        value={robotData.robotId}
                        onChange={(e) =>
                          setRobotData({
                            ...robotData,
                            robotId: e.target.value,
                          })
                        }
                      />
                    ) : (
                      robot.robotId
                    )}
                  </td>
                  <td>
                    {robot._id === editRobot ? (
                      <input
                        type="number"
                        value={robotData.ram}
                        onChange={(e) =>
                          setRobotData({
                            ...robotData,
                            ram: e.target.value,
                          })
                        }
                      />
                    ) : (
                      robot.ram
                    )}
                  </td>
                  <td>
                    {robot._id === editRobot ? (
                      <input
                        type="text"
                        value={robotData.cpu}
                        onChange={(e) =>
                          setRobotData({
                            ...robotData,
                            cpu: e.target.value,
                          })
                        }
                      />
                    ) : (
                      robot.cpu
                    )}
                  </td>
                  <td>
                    {robot._id === editRobot ? (
                      <input
                        type="number"
                        value={robotData.rom}
                        onChange={(e) =>
                          setRobotData({
                            ...robotData,
                            rom: e.target.value,
                          })
                        }
                      />
                    ) : (
                      robot.rom
                    )}
                  </td>
                  <td>
                    {robot._id === editRobot ? (
                      <input
                        type="text"
                        value={robotData.manufacturer}
                        onChange={(e) =>
                          setRobotData({
                            ...robotData,
                            manufacturer: e.target.value,
                          })
                        }
                      />
                    ) : (
                      robot.manufacturer
                    )}
                  </td>
                  <td>
                    {robot._id === editRobot ? (
                      <input
                        type="number"
                        value={robotData.yearOfManufacture}
                        onChange={(e) =>
                          setRobotData({
                            ...robotData,
                            yearOfManufacture: e.target.value,
                          })
                        }
                      />
                    ) : (
                      robot.yearOfManufacture
                    )}
                  </td>

                  {/* API Key Column with only copy icon */}
                  <td>
                    <i
                      className={`fa-solid ${
                        copied === robot._id ? "fa-check" : "fa-copy"
                      } copy-icon`}
                      onClick={() => {
                        navigator.clipboard.writeText(robot.apiKey);
                        setCopied(robot._id);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      style={{ cursor: "pointer" }}
                    ></i>
                  </td>

                  {/* Actions */}
                  <td
                    style={{
                      display: "flex",
                      justifyContent: "space-evenly",
                      alignItems: "center",
                    }}
                  >
                    {robot._id === editRobot ? (
                      <button className="approve" onClick={handleUpdate}>
                        <i className="fa-regular fa-circle-check icon-check"></i>
                      </button>
                    ) : (
                      <button
                        style={{
                          background: "transparent",
                          border: "none",
                          outline: "none",
                        }}
                        className="edit"
                        onClick={() => handleEdit(robot)}
                      >
                        <i
                          className="fa-solid fa-pen"
                          style={{ color: "black" }}
                        ></i>
                      </button>
                    )}
                    <button
                      className="reject"
                      onClick={() => handleDelete(robot._id)}
                    >
                      <i className="fa-solid fa-trash icon-trash-robo"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
