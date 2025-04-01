import { useState, useEffect } from "react";
import "../style/robotControl.css";
import { addControlTitle, addControls, deleteControl, getControlTitlesAndControls } from "../api/api";

export default function RobotControl({ selectedRobot, onSendCommand }) {
  const userRole = localStorage.getItem("role");
  const [sections, setSections] = useState([]);
  const [expandedSection, setExpandedSection] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [newControl, setNewControl] = useState(null);

  // Fetch control titles and controls on component mount
  useEffect(() => {
    const fetchControls = async () => {
      try {
        if (selectedRobot) {
          const data = await getControlTitlesAndControls(selectedRobot);
          console.log("Fetched data:", data); // Debugging

          if (data && Array.isArray(data.sections)) {
            setSections(data.sections);
          } else if (Array.isArray(data)) {
            setSections(data); // Handle direct array response
          }
        }
      } catch (error) {
        console.error("Error fetching controls:", error);
      }
    };

    fetchControls();
  }, [selectedRobot]);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const addControl = (title) => {
    setNewControl({ title, name: "" });
  };

  const saveNewControl = async () => {
    if (newControl && newControl.name.trim()) {
      try {
        await addControls(selectedRobot, newControl.title, [newControl.name]);

        setSections((prev) =>
          prev.map((section) =>
            section.title === newControl.title
              ? { ...section, controls: [...section.controls, newControl.name] }
              : section
          )
        );
      } catch (error) {
        console.error("Error adding control:", error);
      }
    }
    setNewControl(null);
  };

  const deleteControlHandler = async (title, control) => {
    try {
      await deleteControl(selectedRobot, title, control);

      setSections((prev) =>
        prev
          .map((section) =>
            section.title === title
              ? { ...section, controls: section.controls.filter((c) => c !== control) }
              : section
          )
          .filter((section) => section.controls.length > 0)
      );
    } catch (error) {
      console.error("Error deleting control:", error);
    }
  };

  const addSection = async () => {
    if (newTitle.trim()) {
      try {
        await addControlTitle(selectedRobot, newTitle);

        setSections([...sections, { title: newTitle, controls: [] }]);
        setNewTitle("");
      } catch (error) {
        console.error("Error adding section:", error);
      }
    }
  };

  return (
    <div className="robot-container">
      {sections.length === 0 ? (
        <p>No controls available</p>
      ) : (
        sections.map((section) => (
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
            <button className="expand-btn" onClick={() => toggleSection(section.title)}>
              <div>{section.title}</div>
              <div>{expandedSection === section.title ? "-" : "+"}</div>
            </button>
            {expandedSection === section.title && (
              <div className="grid-controls">
                {section.controls.map((control) => (
                  <div key={control} className="control-wrapper">
                    <button className="control-btn" onClick={() => onSendCommand(control)}>
                      {control}
                    </button>
                    {(userRole === "admin" || userRole === "robot_admin") && (
                      <span
                        className="delete-icon"
                        onClick={() => deleteControlHandler(section.title, control)}
                        style={{
                          color: "black",
                          padding: "5px",
                          cursor: "pointer",
                          fontSize: "22px",
                        }}
                      >
                        ×
                      </span>
                    )}
                  </div>
                ))}
                {(userRole === "admin" || userRole === "robot_admin") && (
                  <div>
                    {newControl && newControl.title === section.title ? (
                      <div>
                        <input
                          type="text"
                          placeholder="Enter control name"
                          value={newControl.name}
                          onChange={(e) => setNewControl({ ...newControl, name: e.target.value })}
                          style={{
                            padding: "8px",
                            borderRadius: "5px",
                            border: "1px solid #ccc",
                            width: "150px",
                            marginRight: "10px",
                            marginTop: "5px",
                            fontSize: "14px",
                            outline: "none",
                            transition: "border-color 0.2s",
                          }}
                        />
                        <span
                          className="save-icon"
                          onClick={saveNewControl}
                          style={{ fontSize: "18px", cursor: "pointer", color: "#4CAF50" }}
                        >
                          ✔
                        </span>
                      </div>
                    ) : (
                      <div
                        className="add-symbol"
                        onClick={() => addControl(section.title)}
                        style={{
                          fontSize: "40px",
                          cursor: "pointer",
                          marginLeft: "10px",
                          transition: "transform 0.2s",
                          display: "flex",
                          alignItems: "center",
                          color: "gray",
                        }}
                      >
                        +
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))
      )}
      {(userRole === "admin" || userRole === "robot_admin") && (
        <div
          className="add-section"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "10px",
            marginTop: "20px",
          }}
        >
          <input
            type="text"
            placeholder="Enter new section title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            style={{
              padding: "5px",
              borderRadius: "5px",
              border: "1px solid #ccc",
            }}
          />
          <button
            className="add-section-btn"
            onClick={addSection}
            style={{
              padding: "5px 10px",
              borderRadius: "5px",
              border: "none",
              backgroundColor: "#4CAF50",
              color: "white",
              cursor: "pointer",
            }}
          >
            Add Section
          </button>
        </div>
      )}
    </div>
  );
}
