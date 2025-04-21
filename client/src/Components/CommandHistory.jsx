import React from 'react';
import { FaRobot, FaReply, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

// Default command logs in case no data is provided
const defaultCommandLogs = [
  {
    id: 1,
    command: 'Move Forward',
    status: 'completed',
    response: 'Robot robot1 executed "Move Forward" successfully',
    time: '10:01 AM',
  },
  {
    id: 2,
    command: 'Turn Left',
    status: 'completed',
    response: 'Robot robot1 turned 90° left',
    time: '10:02 AM',
  },
  {
    id: 3,
    command: 'Pick Object',
    status: 'failed',
    response: 'Robot robot1 failed to pick object',
    time: '10:03 AM',
  },
  {
    id: 4,
    command: 'Right Hand Up',
    status: 'completed',
    response: 'Robot robot1 executed "Right Hand Up" successfully',
    time: '10:04 AM',
  },
];

export default function CommandHistory({ robotId, commandLogs = [] }) {
  const logs = commandLogs.length > 0 ? commandLogs : defaultCommandLogs;
  
  const getStatusColor = (status) => {
    if (status === 'completed') return '#34D399'; // green
    if (status === 'failed') return '#EA4335'; // red
    return '#FACC15'; // yellow or other
  };

  const getStatusIcon = (status) => {
    if (status === 'completed') return <FaCheckCircle style={{ color: '#34D399' }} />;
    if (status === 'failed') return <FaTimesCircle style={{ color: '#EA4335' }} />;
    return null;
  };

  return (
    <div
      style={{
        backgroundColor: '#1F1B26',
        padding: '24px',
        borderRadius: '16px',
        color: 'white',
        width: '90%',
        // maxWidth: '750px',
        margin: '0 auto',
        height: '500px',
        overflow: 'scroll',
        // boxShadow: '0 0 20px rgba(154, 77, 255, 0.3)',
        // scrollbarWidth: 'none',
      }}
    >
      <h2 style={{
        color: 'white',
        marginBottom: '24px',
        textAlign: 'left',
        fontSize: '20px',
        letterSpacing: '1px'
      }}>
        {robotId ? `${robotId} Command History` : 'Robot Command History'}
      </h2>

      {logs.length > 0 ? (
        logs.map((log) => (
          <div
            key={log.id}
            style={{
              marginBottom: '16px',
              padding: '16px',
              backgroundColor: '#2A2636',
              borderRadius: '12px',
              border: `1px solid ${getStatusColor(log.status)}33`,
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FaRobot style={{ color: '#9A4DFF' }} />
              <span style={{ fontWeight: 'bold', color: '#9A4DFF' }}>Command:</span>
              <span style={{ color: 'white', fontSize: '15px' }}>{log.command}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {getStatusIcon(log.status)}
              <span style={{ fontWeight: 'bold', color: getStatusColor(log.status) }}>Status:</span>
              <span style={{ color: 'white', fontSize: '15px' }}>{log.status}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FaReply style={{ color: '#34D399' }} />
              <span style={{ fontWeight: 'bold', color: '#34D399' }}>Response:</span>
              <span style={{ color: '#E5E5E5', fontSize: '15px' }}>{log.response}</span>
            </div>

            <div style={{
              textAlign: 'right',
              fontSize: '12px',
              color: '#A7A7A7',
              marginTop: '6px',
              fontStyle: 'italic'
            }}>
              {log.time}
            </div>
          </div>
        ))
      ) : (
        <div style={{ textAlign: 'center', color: '#A7A7A7', marginTop: '50px' }}>
          No command history available for this robot
        </div>
      )}

      <style>
        {`
          div::-webkit-scrollbar {
            width: 0px;
            height: 0px;
          }
        `}
      </style>
    </div>
  );
}
