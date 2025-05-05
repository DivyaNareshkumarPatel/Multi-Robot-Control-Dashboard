import React from 'react';

export default function CircularGraph({ level, heading }) {
  const size = 180;
  const radius = 70;
  const strokeWidth = 25;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (circumference * level) / 100;

  const getColor = (level) => '#007bff'; // Using #007bff blue color

  const styles = {
    wrapper: {
      position: 'relative',
      width: `${size}px`,
      height: `${size}px`,
    },
    svg: {
      transform: 'rotate(-90deg)',
    },
    label: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      fontWeight: 'bold',
      fontSize: '1.4rem',
      color: '#007bff', // Text in blue for light theme
      fontFamily: 'Arial, sans-serif',
    },
    heading: {
      textAlign: 'center',
      color: '#007bff', // Heading in blue
      marginTop: '10px',
      fontWeight: '600',
      fontFamily: 'Arial, sans-serif',
    },
    container: {
      background: '#ffffff', // White background for light mode
      padding: '10px 50px',
      borderRadius: '12px',
      display: 'inline-block',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', // Light shadow for depth
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <svg width={size} height={size} style={styles.svg}>
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="#D3D3D3" // Light gray for the background circle
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke={getColor(level)}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <div style={styles.label}>{level}%</div>
      </div>
      {heading && <div style={styles.heading}>{heading}</div>}
    </div>
  );
}
