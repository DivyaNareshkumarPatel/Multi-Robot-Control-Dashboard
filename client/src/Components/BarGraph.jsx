import React from 'react';
import {
 Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ComposedChart
} from 'recharts';

const data = [
  { month: 'Jan', tasksGiven: 10, tasksCompleted: 8 },
  { month: 'Feb', tasksGiven: 15, tasksCompleted: 13 },
  { month: 'Mar', tasksGiven: 7, tasksCompleted: 6 },
  { month: 'Apr', tasksGiven: 20, tasksCompleted: 18 },
  { month: 'May', tasksGiven: 25, tasksCompleted: 23 },
  { month: 'Jun', tasksGiven: 18, tasksCompleted: 15 },
  { month: 'Jul', tasksGiven: 30, tasksCompleted: 28 },
  { month: 'Aug', tasksGiven: 22, tasksCompleted: 20 },
  { month: 'Sep', tasksGiven: 17, tasksCompleted: 15 },
  { month: 'Oct', tasksGiven: 12, tasksCompleted: 10 },
  { month: 'Nov', tasksGiven: 8, tasksCompleted: 7 },
  { month: 'Dec', tasksGiven: 10, tasksCompleted: 9 },
];

const BarGraph = () => {
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
        Monthly Tasks Given vs Completed
      </h3>
      <ResponsiveContainer width="100%" height="90%">
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="month" stroke="white" />
          <YAxis stroke="white" />
          <Tooltip
            contentStyle={{ backgroundColor: '#1F1B26', border: 'none' }}
            labelStyle={{ color: 'white' }}
            itemStyle={{ color: 'white' }}
          />
          <Bar dataKey="tasksGiven" fill="#9A4DFF" />
          <Line dataKey="tasksCompleted" stroke="white" strokeWidth={2} dot={{ r: 4, fill: 'white' }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarGraph;
