import React, { useState } from 'react';

const RobotControl = () => {
  const [status, setStatus] = useState('Idle');  // To keep track of the robot's current status
  const [selectedRobot, setSelectedRobot] = useState('Robot 1');  // To keep track of the selected robot

  // List of robots to choose from
  const robots = ['Robot 1', 'Robot 2', 'Robot 3'];

  // Control Functions
  const moveForward = () => {
    setStatus('Moving Forward');
    // console.log(${selectedRobot} is moving forward);
  };

  const moveBackward = () => {
    setStatus('Moving Backward');
    // console.log(${selectedRobot} is moving backward);
  };

  const turnLeft = () => {
    setStatus('Turning Left');
    // console.log(${selectedRobot} is turning left);
  };

  const turnRight = () => {
    setStatus('Turning Right');
    // console.log(${selectedRobot} is turning right);
  };

  const stopMovement = () => {
    setStatus('Idle');
    // console.log(${selectedRobot} has stopped);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Robot Control</h1>

      {/* Robot selection */}
      <div style={styles.robotSelection}>
        <label htmlFor="robotSelect" style={styles.robotLabel}>Select Robot:</label>
        <select
          id="robotSelect"
          value={selectedRobot}
          onChange={(e) => setSelectedRobot(e.target.value)}
          style={styles.robotSelect}
        >
          {robots.map((robot, index) => (
            <option key={index} value={robot}>
              {robot}
            </option>
          ))}
        </select>
      </div>

      <div style={styles.status}>
        <p style={styles.statusText}>Current Status: {status}</p>
      </div>

      <div style={styles.controls}>
        <button onClick={moveForward} style={styles.controlButton}>Move Forward</button>

        <div style={styles.directionButtons}>
          <button onClick={turnLeft} style={styles.controlButton}>Turn Left</button>
          <button onClick={turnRight} style={styles.controlButton}>Turn Right</button>
        </div>

        <button onClick={moveBackward} style={styles.controlButton}>Move Backward</button>
        <button onClick={stopMovement} style={styles.stopButton}>Stop</button>
      </div>
    </div>
  );
};

// Styles for the dark theme
const styles = {
  container: {
    width: '100%',
    height: '100vh',
    padding: '20px',
    color: '#fff',
    backgroundColor: '#1F1B26',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '10px',
  },
  header: {
    color: '#fff',
    fontSize: '2.5rem',
    marginBottom: '20px',
  },
  robotSelection: {
    marginBottom: '30px',
  },
  robotLabel: {
    fontSize: '1.2rem',
    color: '#fff',
    marginRight: '10px',
  },
  robotSelect: {
    padding: '10px',
    fontSize: '1rem',
    backgroundColor: '#333',
    color: '#fff',
    borderRadius: '8px',
    border: '1px solid #444',
  },
  status: {
    marginBottom: '30px',
  },
  statusText: {
    fontSize: '1.5rem',
    color: '#fff',
  },
  controls: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '15px',
  },
  controlButton: {
    backgroundColor: '#333',
    color: '#fff',
    border: '1px solid #444',
    borderRadius: '8px',
    padding: '15px 30px',
    fontSize: '1.2rem',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  directionButtons: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '250px',
  },
  stopButton: {
    backgroundColor: '#e74c3c',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '15px 30px',
    fontSize: '1.2rem',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
};

// Export the component
export default RobotControl;