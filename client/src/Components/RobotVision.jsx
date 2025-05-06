import React from "react";
import Lidar3D from '../Components/Lidar3D'
export default function RobotVision() {
  return (
    <div className="robot-vision-container">
      {/* <div className="robot-camera">
        <div className="camera-feed">
          <img alt="Camera feed will appear here" />
        </div>
      </div> */}
      <div className="robot-mapping">
        <div className="mapping-area">
          <Lidar3D/>
        </div>
      </div>
    </div>
  );
}
