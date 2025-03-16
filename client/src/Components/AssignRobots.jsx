import React, { useEffect, useState } from 'react';
import '../style/user.css';
import { FaTimes } from 'react-icons/fa';
import { getAllRobots, userDetails, assignRobotToUser, getAssignedRobots, deassignRobotFromUser } from '../api/api';

export default function AssignRobots() {
  const [users, setUsers] = useState([]);
  const [availableRobots, setAvailableRobots] = useState([]);
  const [assignedRobots, setAssignedRobots] = useState({});
  const [selectedRobots, setSelectedRobots] = useState({});
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchRobots();
  }, []);

  const fetchUsers = async () => {
    const response = await userDetails();
    if (response.status === 200) {
      setUsers(response.data);
      fetchAssignedRobots(response.data);
    }
  };

  const fetchRobots = async () => {
    const response = await getAllRobots();
    if (response.status === 200) {
      setAvailableRobots(response.data);
    }
  };

  const fetchAssignedRobots = async (users) => {
    const assignedData = {};
    for (const user of users) {
      const response = await getAssignedRobots(user._id);
      if (response.status === 200) {
        assignedData[user._id] = response.data;
      }
    }
    setAssignedRobots(assignedData);
  };

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 3000); // Message disappears after 3 seconds
  };

  const handleAssignRobot = async (userId) => {
    const robotId = selectedRobots[userId];
    if (!robotId) return;
    
    const response = await assignRobotToUser(userId, robotId);
    if (response.status === 200) {
      const assignedRobot = availableRobots.find(robot => robot._id === robotId);
      setAssignedRobots({
        ...assignedRobots,
        [userId]: [...(assignedRobots[userId] || []), assignedRobot]
      });
      showMessage(`Robot ${assignedRobot.robotName} assigned to ${users.find(user => user._id === userId).name}`, 'success');
      setSelectedRobots({ ...selectedRobots, [userId]: '' });
    } else {
      showMessage('Failed to assign robot.', 'error');
    }
  };

  const handleRemoveRobot = async (userId, robotId) => {
    const response = await deassignRobotFromUser(userId, robotId);
    if (response.status === 200) {
      setAssignedRobots({
        ...assignedRobots,
        [userId]: assignedRobots[userId].filter(robot => robot._id !== robotId)
      });
      showMessage('Robot removed successfully.', 'success');
    } else {
      showMessage('Failed to remove robot.', 'error');
    }
  };

  return (
    <div className="dashboard-content" style={{ paddingLeft: '20px', paddingRight: '20px' }}>
      <div className="table-container">
        <table className="user-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Username</th>
              <th>Email</th>
              <th>Assign Robot</th>
              <th>Assigned Robots</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>
                  <select
                    className="robot-select"
                    value={selectedRobots[user._id] || ''}
                    onChange={(e) => setSelectedRobots({ ...selectedRobots, [user._id]: e.target.value })}
                  >
                    <option value="">Select Robot</option>
                    {availableRobots.map(robot => (
                      <option key={robot._id} value={robot._id}>
                        {robot.robotName}
                      </option>
                    ))}
                  </select>
                  <button className="assign-btn" onClick={() => handleAssignRobot(user._id)}>
                    Assign
                  </button>
                </td>
                <td style={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", height: "fit-content", paddingTop: "7px", paddingBottom: "5px" }}>
                  {assignedRobots[user._id] && assignedRobots[user._id].length > 0 ? (
                    assignedRobots[user._id].map(robot => (
                      <span key={robot._id} className="assigned-robot" style={{ marginBottom: "2px" }}>
                        {robot.robotName}
                        <FaTimes className="remove-icon" onClick={() => handleRemoveRobot(user._id, robot._id)} />
                      </span>
                    ))
                  ) : (
                    <span style={{ color: 'gray' }}>No robot assigned</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {message && <div className={`messageWrapper ${messageType}`}>{message}</div>}
    </div>
  );
}
