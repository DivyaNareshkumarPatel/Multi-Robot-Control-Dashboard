import React from "react";

export default function RobotVision() {
  return (
    <div className="robot-vision-container">
      <div className="robot-camera">
        <div className="camera-feed">
          <img alt="Camera feed will appear here" />
        </div>
      </div>
      <div className="robot-mapping">
        <div className="mapping-area">
          <img alt="Robot mapping will appear here" />
        </div>
      </div>
    </div>
  );
}
