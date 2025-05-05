import React, { useState, useEffect, useMemo } from 'react';
import {
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ComposedChart
} from 'recharts';

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const BarGraph = ({ robotId, commandLogs = [] }) => {
  const [data, setData] = useState([]);
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState('All');

  // Group logs by year & month
  const groupedLogs = useMemo(() => {
    const grouped = {};

    commandLogs.forEach(log => {
      console.log(log);
      const date = new Date(`${log.date} ${log.time}`);
      if (isNaN(date)) return;

      const year = date.getFullYear();
      const month = monthNames[date.getMonth()];
      const key = `${year}-${month}`;

      if (!grouped[key]) {
        grouped[key] = {
          year,
          month,
          tasksGiven: 0,
          tasksCompleted: 0,
        };
      }

      grouped[key].tasksGiven += 1;
      if (log.status === 'completed') grouped[key].tasksCompleted += 1;
    });

    return Object.values(grouped).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return monthNames.indexOf(a.month) - monthNames.indexOf(b.month);
    });
  }, [commandLogs]);

  const allYears = useMemo(() => {
    const years = commandLogs
      .map(log => {
        const date = new Date(`${log.date} ${log.time}`);
        return isNaN(date) ? null : date.getFullYear();
      })
      .filter(Boolean);
    return ['All', ...Array.from(new Set(years))];
  }, [commandLogs]);

  const filteredMonths = useMemo(() => {
    return ['All', ...Array.from(new Set(
      groupedLogs
        .filter(d => selectedYear === 'All' || d.year === +selectedYear)
        .map(d => d.month)
    ))];
  }, [groupedLogs, selectedYear]);

  useEffect(() => {
    const filtered = groupedLogs.filter(item => {
      const yearMatch = selectedYear === 'All' || item.year === +selectedYear;
      const monthMatch = selectedMonth === 'All' || item.month === selectedMonth;
      return yearMatch && monthMatch;
    });

    setData(filtered);
  }, [groupedLogs, selectedYear, selectedMonth]);

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
      <h3 style={{ textAlign: 'center', marginBottom: '10px' }}>
        {robotId ? `${robotId} - Commands Overview` : 'Commands Overview'}
      </h3>

      {/* Filters */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '20px' }}>
        <div>
          <label style={{ marginRight: '8px' }}>Year:</label>
          <select value={selectedYear} onChange={e => {
            setSelectedYear(e.target.value);
            setSelectedMonth('All');
          }}>
            {allYears.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ marginRight: '8px' }}>Month:</label>
          <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}>
            {filteredMonths.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height="80%">
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="month" stroke="#007bff" />
          <YAxis stroke="#007bff" />
          <Tooltip
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
            labelStyle={{ color: '#000' }}
            itemStyle={{ color: '#000' }}
          />
          <Bar dataKey="tasksGiven" fill="#007bff" />
          <Line dataKey="tasksCompleted" stroke="#6c757d" strokeWidth={2} dot={{ r: 4, fill: '#6c757d' }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarGraph;
