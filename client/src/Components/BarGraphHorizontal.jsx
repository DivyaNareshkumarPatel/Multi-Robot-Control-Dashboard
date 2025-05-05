import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';

// Updated data with `year` included
const defaultData = [
  { month: 'Jan', year: 2024, conversations: 50 },
  { month: 'Feb', year: 2024, conversations: 65 },
  { month: 'Mar', year: 2024, conversations: 40 },
  { month: 'Apr', year: 2024, conversations: 75 },
  { month: 'May', year: 2024, conversations: 90 },
  { month: 'Jun', year: 2024, conversations: 70 },
  { month: 'Jul', year: 2024, conversations: 100 },
  { month: 'Aug', year: 2024, conversations: 85 },
  { month: 'Sep', year: 2024, conversations: 60 },
  { month: 'Oct', year: 2024, conversations: 45 },
  { month: 'Nov', year: 2024, conversations: 30 },
  { month: 'Dec', year: 2024, conversations: 55 },

  { month: 'Jan', year: 2025, conversations: 60 },
  { month: 'Feb', year: 2025, conversations: 68 },
  { month: 'Mar', year: 2025, conversations: 45 },
  { month: 'Apr', year: 2025, conversations: 80 },
  { month: 'May', year: 2025, conversations: 95 },
  { month: 'Jun', year: 2025, conversations: 75 },
];

const BarGraphHorizontal = ({ robotId }) => {
  const [data, setData] = useState(defaultData);
  const [selectedYear, setSelectedYear] = useState('2025');  // 👈 default year is 2025
  const [selectedMonth, setSelectedMonth] = useState('All');

  const years = ['All', ...Array.from(new Set(defaultData.map(d => d.year)))];
  const months = ['All', ...Array.from(
    new Set(
      defaultData
        .filter(d => selectedYear === 'All' || d.year === +selectedYear)
        .map(d => d.month)
    )
  )];

  useEffect(() => {
    let transformedData = defaultData;

    if (robotId) {
      const robotHash = robotId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 10;
      transformedData = defaultData.map(item => ({
        ...item,
        conversations: Math.max(10, Math.floor(item.conversations * (1 + robotHash / 10)))
      }));
    }

    const filtered = transformedData.filter(item => {
      const yearMatch = selectedYear === 'All' || item.year === +selectedYear;
      const monthMatch = selectedMonth === 'All' || item.month === selectedMonth;
      return yearMatch && monthMatch;
    });

    setData(filtered);
  }, [robotId, selectedYear, selectedMonth]);

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '600px',
        height: '500px',
        margin: '0 auto',
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '12px',
        color: '#000',
      }}
    >
      <h3 style={{ textAlign: 'center', color: '#000', marginBottom: '10px' }}>
        {robotId ? `${robotId} - Monthly Conversation Count` : 'Monthly Conversation Count'}
      </h3>

      {/* Filters */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '20px' }}>
        <div>
          <label style={{ marginRight: '8px' }}>Year:</label>
          <select value={selectedYear} onChange={e => {
            setSelectedYear(e.target.value);
            setSelectedMonth('All');
          }}>
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ marginRight: '8px' }}>Month:</label>
          <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}>
            {months.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="90%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 50, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis type="number" stroke="#007bff" />
          <YAxis type="category" dataKey="month" stroke="#007bff" />
          <Tooltip
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
            labelStyle={{ color: '#000' }}
            itemStyle={{ color: '#007bff' }}
          />
          <Bar dataKey="conversations" fill="#007bff" barSize={40} activeBar={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarGraphHorizontal;
