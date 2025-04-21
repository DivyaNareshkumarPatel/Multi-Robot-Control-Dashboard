import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';

const defaultData = [
  { month: 'Jan', conversations: 50 },
  { month: 'Feb', conversations: 65 },
  { month: 'Mar', conversations: 40 },
  { month: 'Apr', conversations: 75 },
  { month: 'May', conversations: 90 },
  { month: 'Jun', conversations: 70 },
  { month: 'Jul', conversations: 100 },
  { month: 'Aug', conversations: 85 },
  { month: 'Sep', conversations: 60 },
  { month: 'Oct', conversations: 45 },
  { month: 'Nov', conversations: 30 },
  { month: 'Dec', conversations: 55 },
];

const BarGraphHorizontal = ({ robotId }) => {
  const [data, setData] = useState(defaultData);

  useEffect(() => {
    if (robotId) {
      const robotHash = robotId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 10;
      
      const newData = defaultData.map(item => ({
        ...item,
        conversations: Math.max(10, Math.floor(item.conversations * (1 + robotHash / 10)))
      }));
      
      setData(newData);
    }
  }, [robotId]);

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '600px',
        height: '500px',
        margin: '0 auto',
        backgroundColor: '#1F1B26',
        padding: '20px',
        borderRadius: '12px',
        color: 'white',
      }}
    >
      <h3 style={{ textAlign: 'center', color: 'white', marginBottom: '10px' }}>
        {robotId ? `${robotId} - Monthly Conversation Count` : 'Monthly Conversation Count'}
      </h3>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 50, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis type="number" stroke="white" />
          <YAxis type="category" dataKey="month" stroke="white" />
          <Tooltip
            contentStyle={{ backgroundColor: '#1F1B26', border: 'none' }}
            labelStyle={{ color: 'white' }}
            itemStyle={{ color: '#9A4DFF' }}
          />
          <Bar dataKey="conversations" fill="#9A4DFF" barSize={40} activeBar={false}/>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarGraphHorizontal;
