import React, { useState, useEffect } from "react";
import RobotDetails from "./RobotDetails";
import { robotRegistration } from "../api/api";
import "../style/robotControl.css";

const RobotRegistration = () => {
  const [activeTab, setActiveTab] = useState(
    localStorage.getItem("robotActiveTab") || "registration"
  );
  const [formData, setFormData] = useState({
    robotName: "",
    robotId: "",
    ram: "",
    cpu: "",
    rom: "",
    manufacturer: "",
    yearOfManufacture: "",
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    localStorage.setItem("robotActiveTab", activeTab);
  }, [activeTab]);

  const validateForm = () => {
    let newErrors = {};
    if (!formData.robotName.trim())
      newErrors.robotName = "Please enter a Robot Name.";
    if (!formData.robotId.trim()) newErrors.robotId = "Robot ID is required.";
    if (
      !formData.ram.trim() ||
      isNaN(formData.ram) ||
      Number(formData.ram) <= 0
    )
      newErrors.ram = "Invalid RAM.";
    if (!formData.cpu.trim()) newErrors.cpu = "CPU information is required.";
    if (
      !formData.rom.trim() ||
      isNaN(formData.rom) ||
      Number(formData.rom) <= 0
    )
      newErrors.rom = "Invalid ROM.";
    if (!formData.manufacturer.trim())
      newErrors.manufacturer = "Manufacturer is required.";
    if (
      !formData.yearOfManufacture.trim() ||
      isNaN(formData.yearOfManufacture) ||
      formData.yearOfManufacture.length !== 4
    )
      newErrors.yearOfManufacture = "Enter a valid 4-digit year.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const response = await robotRegistration(formData);
      console.log("API Response:", response);

      // Check if the response indicates success
      if (response.data && response.data.success) {
        setSuccessMessage("Robot Registered Successfully!");
        setFormData({
          robotName: "",
          robotId: "",
          ram: "",
          cpu: "",
          rom: "",
          manufacturer: "",
          yearOfManufacture: "",
        });

        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage("");
        }, 3000);
      } else {
        setErrors({
          general: response.data.message || "Registration failed.",
        });

        // Clear error message after 3 seconds
        setTimeout(() => {
          setErrors({});
        }, 3000);
      }
    } catch (error) {
      const errorMsg =
        error?.response?.data?.message || "Robot Id already exists";
      setErrors({ general: errorMsg });
      setTimeout(() => {
        setErrors({});
      }, 3000);
    }
  };

  return (
    <div style={styles.container}>
      <nav className="innerNav">
        <div
          className={activeTab === "registration" ? "active-tab" : ""}
          onClick={() => setActiveTab("registration")}
        >
          Robot Registration
        </div>
        <div
          className={activeTab === "detail" ? "active-tab" : ""}
          onClick={() => setActiveTab("detail")}
        >
          Robot Details
        </div>
      </nav>

      {activeTab === "registration" && (
        <div
          className="robotRegistration"
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <h1 style={styles.header}>Robot Registration Form</h1>
          {successMessage && (
            <p style={styles.successMessage}>{successMessage}</p>
          )}
          {errors.general && (
            <p style={styles.errorMessage}>{errors.general}</p>
          )}
          <form
            onSubmit={handleSubmit}
            style={styles.form}
            className="robot-registration-form"
          >
            {Object.entries(formData).map(([key, value]) => (
              <div key={key} style={styles.inputGroup}>
                <label htmlFor={key} style={styles.label}>
                  {key.replace(/([A-Z])/g, " $1").trim()}:
                </label>
                <input
                  type={
                    ["ram", "rom", "yearOfManufacture"].includes(key)
                      ? "number"
                      : "text"
                  }
                  id={key}
                  name={key}
                  value={value}
                  onChange={handleChange}
                  style={{
                    ...styles.input,
                    borderColor: errors[key] ? "#ff4d4d" : "white",
                  }}
                />
                {errors[key] && (
                  <p style={styles.errorMessage}>{errors[key]}</p>
                )}
              </div>
            ))}
            <button type="submit" style={styles.submitButton}>
              Register Robot
            </button>
          </form>
        </div>
      )}

      {activeTab === "detail" && (
        <div className="robotDetail">
          <h1 style={styles.header}>Robot Details</h1>
          <RobotDetails />
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    width: "100%",
    color: "#fff",
    overflowX: "hidden",
    display: "flex",
    flexDirection: "column",
    background:"rgb(244, 244, 244)",
     height:"100vh"
    // alignItems: "center",
  },
  header: { color: "black", fontSize: "24px", marginBottom: "20px", marginLeft:"40px" },
  successMessage: { 
    color: "#388E3C",  // Darker green for success in light mode
    fontSize: "18px", 
    marginBottom: "10px" 
  },
  
  errorMessage: { 
    color: "#D32F2F",  // Darker red for error in light mode
    fontSize: "14px", 
    marginTop: "5px" 
  },
  form: {
    width: "80%",
    maxWidth: "700px",
    height: "83vh",
    overflowY: "scroll",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  inputGroup: {
    marginBottom: "15px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  label: {
    width: "90%",
    fontSize: "16px",
    marginBottom: "5px",
    color: "black",
  },
  input: {
    width: "90%",
    padding: "10px",
    backgroundColor: "#ffffff", // Lighter background color for light mode
    border: "1px solid black", // Light border color
    borderRadius: "8px", // Dark text color for better readability
    fontSize: "14px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"
  },

  submitButton: {
    padding: "12px 25px",
    backgroundColor: "#007BFF",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    cursor: "pointer",
    width: "90%",
    marginLeft: "34px",
    marginBottom: "20px",
  },
};

export default RobotRegistration;
