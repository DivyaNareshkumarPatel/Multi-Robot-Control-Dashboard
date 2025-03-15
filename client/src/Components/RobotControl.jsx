import { useState } from "react";
import "../style/robotControl.css";

export default function RobotControl() {
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="robot-container">
      {[
        {
          title: "Hands",
          controls: [
            "Hands Up",
            "Right Hand Up",
            "Left Hand Up",
            "Hands Down",
            "Hand Shake",
            "Right Hand Down",
            "Left Hand Down",
          ],
        },
        {
          title: "Head",
          controls: ["Head Forward", "Head Right", "Head Left"],
        },
        {
          title: "Chest",
          controls: ["Chest Forward", "Chest Right", "Chest Left"],
        },
        {
          title: "Base Motors",
          controls: [
            "Move Forward",
            "Move Backward",
            "Stop",
            "Move Right",
            "Move Left",
            "Move Right Motor",
            "Move Left Motor",
            "Move Right Stop",
            "Move Left Stop",
          ],
        },
        {
          title: "Talking",
          controls: [
            "Talking",
          ],
        },
      ].map((section) => (
        <div
          key={section.title}
          className="control-section"
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            marginBottom: "10px",
          }}
        >
          <button
            className="expand-btn"
            onClick={() => toggleSection(section.title)}
          >
            <div>{section.title}</div>
            <div>{expandedSection === section.title ? "-" : "+"}</div>
          </button>
          {expandedSection === section.title && (
            <div className="grid-controls">
              {section.controls.map((control) => (
                <button key={control} className="control-btn">
                  {control}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
