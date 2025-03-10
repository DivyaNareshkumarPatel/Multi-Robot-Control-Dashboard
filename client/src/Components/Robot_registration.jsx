import React, { useState } from "react";
import {robotRegistration} from '../api/api'
import '../style/robotControl.css'

const RobotRegistration = () => {
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

  const validateForm = () => {
    let newErrors = {};

    if (!formData.robotName.trim()) {
      newErrors.robotName = "Please enter a Robot Name.";
    } else if (formData.robotName.length < 3) {
      newErrors.robotName = "Robot Name must be at least 3 characters long.";
    }

    if (!formData.robotId.trim()) {
      newErrors.robotId = "Robot ID is required.";
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.robotId)) {
      newErrors.robotId =
        'Robot ID can only contain letters, numbers, "_" or "-".';
    }

    if (!formData.ram.trim()) {
      newErrors.ram = "RAM is required.";
    } else if (isNaN(formData.ram) || Number(formData.ram) <= 0) {
      newErrors.ram = `Invalid RAM value: ${formData.ram}. It must be a positive number.`;
    }

    if (!formData.cpu.trim()) {
      newErrors.cpu = "CPU information is required.";
    }

    if (!formData.rom.trim()) {
      newErrors.rom = "ROM is required.";
    } else if (isNaN(formData.rom) || Number(formData.rom) <= 0) {
      newErrors.rom = `Invalid ROM value: ${formData.rom}. It must be a positive number.`;
    }

    if (!formData.manufacturer.trim()) {
      newErrors.manufacturer = "Manufacturer name is required.";
    }

    if (!formData.yearOfManufacture.trim()) {
      newErrors.yearOfManufacture = "Manufacture Year is required.";
    } else if (
      isNaN(formData.yearOfManufacture) ||
      formData.yearOfManufacture.length !== 4
    ) {
      newErrors.yearOfManufacture = "Enter a valid 4-digit year.";
    } else {
      const currentYear = new Date().getFullYear();
      const year = Number(formData.yearOfManufacture);
      if (year > currentYear) {
        newErrors.yearOfManufacture = `Future year entered: ${year}. Enter a past or present year.`;
      } else if (year < 1900) {
        newErrors.yearOfManufacture = `Year too old: ${year}. Enter a more recent year (>= 1900).`;
      }
    }

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
    setSuccessMessage("");

    if (validateForm()) {
      try {
        await robotRegistration({formData})
        setSuccessMessage("Robot Registered Successfully! ✅");
        setFormData({
          robotName: "",
          robotId: "",
          ram: "",
          cpu: "",
          rom: "",
          manufacturer: "",
          yearOfManufacture: "",
        });
        setErrors({});
      } catch (error) {
        console.error("Error registering robot:", error.response?.data || error.message);
        setErrors({ general: "Failed to register robot. Try again later." });
      }
    }
  };

  return (
    <div style={styles.container}>
      <div className="innerNav">
        <div>Robot Registration</div>
        <div>Robot Detail</div>
      </div>
      <h1 style={styles.header}>Robot Registration Form</h1>
      {successMessage && <p style={styles.successMessage}>{successMessage}</p>}
      {errors.general && <p style={styles.errorMessage}>{errors.general}</p>}
      <form onSubmit={handleSubmit} style={styles.form} className="robotRegistrationForm">
        {Object.entries(formData).map(([key, value]) => (
          <div key={key} style={styles.inputGroup}>
            <label htmlFor={key} style={styles.label}>
              {key === "ram"
                ? "RAM (GB):"
                : key === "rom"
                ? "ROM (GB):"
                : key === "cpu"
                ? "CPU (GHz):"
                : key.replace(/([A-Z])/g, " $1").trim() + ":"}
            </label>
            <input
              type={key === "ram" || key === "rom" || key === "yearOfManufacture" ? "number" : "text"}
              id={key}
              name={key}
              value={value}
              onChange={handleChange}
              style={{
                ...styles.input,
                borderColor: errors[key] ? "#ff4d4d" : "white",
              }}
            />
            {errors[key] && <p style={styles.errorMessage}>{errors[key]}</p>}
          </div>
        ))}
        <button type="submit" style={styles.submitButton}>
          Register Robot
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    width: "100%",
    // padding: "20px",
    color: "#fff",
    overflowX:"hidden",
    // overflowY: "scroll",
    // borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  header: { color: "white", fontSize: "24px", marginBottom: "20px", width:"100%", marginLeft:"20px" },
  successMessage: { color: "#4CAF50", fontSize: "18px", marginBottom: "10px" },
  errorMessage: { color: "#ff4d4d", fontSize: "14px", marginTop: "5px" },
  form: {
    width: "80%",
    maxWidth: "700px",
    overflowY:"scroll",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  inputGroup: { marginBottom: "15px", display:"flex", flexDirection:"column", alignItems:"center" },
  label: {
    width:"90%",
    display: "block",
    fontSize: "16px",
    color: "white",
    marginBottom: "5px",
  },
  input: {
    width: "90%",
    padding: "10px",
    backgroundColor: "#191620",
    border: "1px solid white",
    borderRadius: "8px",
    color: "#fff",
    fontSize: "14px",
    transition: "all 0.3s ease",
  },
  submitButton: {
    padding: "12px 25px",
    backgroundColor: "#9A4DFF",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
    alignSelf: "center",
    width: "90%",
    marginBottom:"20px"
  },
};

export default RobotRegistration;