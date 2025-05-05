import React, { useState } from 'react';
import { MdCheckCircle, MdError, MdRefresh } from 'react-icons/md';
const formatDate = (date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

export default function CommandHistory({ robotId, commandLogs = [] }) {
  const [selectedDate, setSelectedDate] = useState('');
  const [tempDate, setTempDate] = useState('');

  const logs = commandLogs;

  // ✅ Compare date strings in DD-MM-YYYY format
  const filteredLogs = selectedDate
    ? logs.filter((log) => {
        const logDate = new Date(log.date); // Convert log date to Date object
        const formattedLogDate = formatDate(logDate); // Format it as DD-MM-YYYY
        return formattedLogDate === selectedDate;
      })
    : logs;
  console.log(logs)
  const getStatusColor = (status) => {
    if (status === 'completed') return '#34D399';
    if (status === 'failed') return '#EA4335';
    return '#FACC15';
  };

  const getStatusIcon = (status) => {
    if (status === 'completed') return <MdCheckCircle style={{ color: '#34D399', fontSize: '20px' }} />;
    if (status === 'failed') return <MdError style={{ color: '#EA4335', fontSize: '20px' }} />;
    return <MdRefresh style={{ color: '#FACC15', fontSize: '20px' }} />;
  };

  const handleFilterApply = () => {
    setSelectedDate(tempDate); // Directly set the date string
  };

  return (
    <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '16px', color: '#000', width: '89%', margin: '0 auto', maxHeight: '500px', overflowY: 'auto', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
      <h2 style={{ color: '#007bff', marginBottom: '24px', textAlign: 'left', fontSize: '24px', fontWeight: '600', letterSpacing: '1px' }}>
        {robotId ? `${robotId} Command History` : 'Robot Command History'}
      </h2>

      {/* Date Filter UI */}
      <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <label htmlFor="dateFilter" style={{ fontWeight: 'bold', color: '#007bff' }}>Filter by Date:</label>
        <input
          type="date"
          id="dateFilter"
          onChange={(e) => {
            const date = e.target.value;
            const [year, month, day] = date.split('-');
            setTempDate(`${day}-${month}-${year}`);
          }}
          value={tempDate}
          readOnly={false}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '16px' }}
        />
        <button
          onClick={handleFilterApply}
          style={{
            padding: '8px 16px',
            borderRadius: '4px',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Apply Filter
        </button>
        {selectedDate && (
          <button
            onClick={() => {
              setSelectedDate('');
              setTempDate('');
            }}
            style={{
              padding: '8px 16px',
              borderRadius: '4px',
              backgroundColor: '#A7A7A7',
              color: '#fff',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Clear Filter
          </button>
        )}
      </div>

      {selectedDate && (
        <div style={{ marginBottom: '16px', color: '#404040', fontStyle: 'italic' }}>
          Showing results for <strong>{selectedDate}</strong>
        </div>
      )}

      {filteredLogs.length > 0 ? (
        filteredLogs.map((log) => (
          <div key={log.id} style={{
            marginBottom: '16px',
            padding: '20px',
            backgroundColor: '#f7f7f7',
            borderRadius: '12px',
            border: `1px solid ${getStatusColor(log.status)}33`,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <MdCheckCircle style={{ color: '#007bff', fontSize: '18px' }} />
              <span style={{ fontWeight: 'bold', color: '#007bff', fontSize: '16px' }}>Command:</span>
              <span style={{ color: '#000', fontSize: '16px' }}>{log.command}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {getStatusIcon(log.status)}
              <span style={{ fontWeight: 'bold', color: getStatusColor(log.status), fontSize: '16px' }}>Status:</span>
              <span style={{ color: '#000', fontSize: '16px' }}>{log.status}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <MdRefresh style={{ color: '#34D399', fontSize: '18px' }} />
              <span style={{ fontWeight: 'bold', color: '#34D399', fontSize: '16px' }}>Response:</span>
              <span style={{ color: '#333', fontSize: '16px' }}>{log.response}</span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '14px',
              color: '#A7A7A7'
            }}>
              <span style={{ fontStyle: 'italic' }}>Date: {formatDate(new Date(log.date))}</span>
              <span>Time: {log.time}</span>
            </div>
          </div>
        ))
      ) : (
        <div style={{ textAlign: 'center', color: '#A7A7A7', marginTop: '50px' }}>
          No command history available for this robot
        </div>
      )}
    </div>
  );
}
