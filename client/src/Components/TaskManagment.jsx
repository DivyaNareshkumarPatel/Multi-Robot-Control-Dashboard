import React from "react";
import BarGraph from "./BarGraph";
import BarGraphHorizontal from "./BarGraphHorizontal";
import CommandHistory from "./CommandHistory";
export default function TaskManagment() {
  return (
    <div style={{
      overflow: "scroll",
      height: "100vh",
      scrollbarWidth: "none",
      msOverflowStyle: "none",
    }}>
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            margin: "20px",
          }}
        >
          <BarGraph />
          <BarGraphHorizontal />
        </div>
        <div>
          <CommandHistory />
        </div>
      </div>
    </div>
  );
}
