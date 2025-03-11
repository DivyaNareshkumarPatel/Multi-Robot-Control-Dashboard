import "../style/robotControl.css";

export default function RobotControl() {
  return (
    <div className="robot-container">
      <div className="grid-controls" style={{marginLeft:"20px", marginRight:"20px"}}>
        <button className="control-btn">
          Forward
        </button>
        <button className="control-btn">
          Left
        </button>
        <button className="control-btn stop-btn">
          Stop
        </button>
        <button className="control-btn">
          Right
        </button>
        <button className="control-btn">
          Backward
        </button>
        <button className="control-btn">
          Rotate Left
        </button>
        <button className="control-btn">
          Rotate Right
        </button>
        <button className="control-btn speed-up">
          Speed Up
        </button>
        <button className="control-btn slow-down">
          Slow Down
        </button>
      </div>
    </div>
  );
}
