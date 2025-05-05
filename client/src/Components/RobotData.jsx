import React from 'react'

const robotDataStyle = {
  container: {
    background: "#FFFFFF", // White background for light mode
    height: "80px",
    width: "280px",
    borderRadius: "12px", // Slightly more rounded edges
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)", // Soft shadow for depth
    padding: "20px",
    color: "#333333", // Darker text color for contrast
  },
  heading: {
    fontSize: "16px", // Smaller heading for a sleek look
    fontWeight: "bold",
    color: "#2C3E50", // Darker color for the heading to stand out
    marginBottom: "10px",
  },
  data: {
    fontSize: "24px", // Larger text for the data value
    fontWeight: "600",
    color: "#3498DB", // Accent color for the data
  }
};

export default function RobotData({ heading, data }) {
  return (
    <div>
      <div style={robotDataStyle.container}>
        <p style={robotDataStyle.heading}>{heading}</p>
        <p style={robotDataStyle.data}>{data}</p>
      </div>
    </div>
  );
}
