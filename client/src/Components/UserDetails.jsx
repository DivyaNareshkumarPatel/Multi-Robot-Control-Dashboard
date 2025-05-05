import React, { useState, useEffect } from "react";
import {
  userDetails,
  handleUserPermissionLogin,
  updateUser,
  addUser,
} from "../api/api";
import "../style/adminDashboard.css";

export default function UserDetails() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editUserId, setEditUserId] = useState(null);
  const [addingUser, setAddingUser] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    role: "",
    password: "",
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await userDetails();
        setUsers(response.data);
        setLoading(false);
      } catch (err) {
        setError("Error fetching users");
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleEdit = (user) => {
    setEditUserId(user._id);
    setFormData({
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      password: "",
    });
    setAddingUser(false);
  };

  const handleReject = async (id) => {
    try {
      await handleUserPermissionLogin({ endpoint: "/reject", id });
      setUsers(users.filter((u) => u._id !== id));
    } catch (err) {
      setError("Error rejecting user");
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const checkIfExists = (name, value) => {
    return users.some((user) => user[name] === value);
  };

  const handleUpdate = async () => {
    // Check for empty fields except password
    if (!formData.name || !formData.username || !formData.email || !formData.role) {
      setError("All fields are required.");
      return;
    }

    // Validate email format
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Please enter a valid email.");
      return;
    }

    // Check if email or username already exists (excluding current user)
    if (checkIfExists("email", formData.email) && formData.email !== users.find((user) => user._id === editUserId)?.email) {
      setError("Email is already taken.");
      return;
    }

    if (checkIfExists("username", formData.username) && formData.username !== users.find((user) => user._id === editUserId)?.username) {
      setError("Username is already taken.");
      return;
    }

    // Retain the existing password if no new password is entered
    const updatedFormData = {
      ...formData,
      password: formData.password || users.find((user) => user._id === editUserId)?.password, // Use old password if empty
    };

    try {
      await updateUser(editUserId, updatedFormData);
      const updatedUsers = users.map((user) =>
        user._id === editUserId ? { ...user, ...updatedFormData } : user
      );
      setUsers(updatedUsers);
      setEditUserId(null);
      resetForm();
    } catch (err) {
      setError("Error updating user");
    }
  };

  const handleAddUser = async () => {
    // Check for empty fields
    if (!formData.name || !formData.username || !formData.email || !formData.role || !formData.password) {
      setError("All fields are required.");
      return;
    }

    // Validate email format
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Please enter a valid email.");
      return;
    }

    // Check if email or username already exists
    if (checkIfExists("email", formData.email)) {
      setError("Email is already taken.");
      return;
    }

    if (checkIfExists("username", formData.username)) {
      setError("Username is already taken.");
      return;
    }

    try {
      const response = await addUser(formData);
      setUsers([...users, response.data]);
      setAddingUser(false);
      resetForm();
    } catch (err) {
      setError("Error adding user");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      username: "",
      email: "",
      role: "",
      password: "",
    });
  };

  const handleCancel = () => {
    setEditUserId(null);
    setAddingUser(false);
    resetForm();
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null); // Clear error after 3 seconds
      }, 3000);

      // Clean up the timeout when the component unmounts or when error changes
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="dashboard-content" style={{ paddingLeft: "20px", paddingRight: "20px" }}>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="table-container">
          <table className="user-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Password</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>
                    {editUserId === user._id ? (
                      <input type="text" name="name" value={formData.name} onChange={handleChange} />
                    ) : (
                      user.name
                    )}
                  </td>
                  <td>
                    {editUserId === user._id ? (
                      <input type="text" name="username" value={formData.username} onChange={handleChange} />
                    ) : (
                      user.username
                    )}
                  </td>
                  <td>
                    {editUserId === user._id ? (
                      <input type="email" name="email" value={formData.email} onChange={handleChange} />
                    ) : (
                      user.email
                    )}
                  </td>
                  <td>
                    {editUserId === user._id ? (
                      <select name="role" value={formData.role} onChange={handleChange}>
                        <option value="">Select Role</option>
                        <option value="admin">Admin</option>
                        <option value="robot_admin">Robot Admin</option>
                        <option value="robot_operator">Robot Operator</option>
                      </select>
                    ) : (
                      user.role
                    )}
                  </td>
                  <td>
                    {editUserId === user._id ? (
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="New Password"
                      />
                    ) : (
                      "••••••"
                    )}
                  </td>
                  <td className="permission-buttons">
                    {editUserId === user._id ? (
                      <>
                        <button className="approve" onClick={handleUpdate}>
                          <i className="fa-regular fa-floppy-disk"></i>
                        </button>
                        <button className="reject" onClick={handleCancel}>
                          <i className="fa-regular fa-circle-xmark"></i>
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="edit approve" onClick={() => handleEdit(user)}>
                          <i className="fa-regular fa-pen-to-square"></i>
                        </button>
                        <button className="reject" onClick={() => handleReject(user._id)}>
                          <i className="fa-regular fa-circle-xmark"></i>
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}

              {/* ADD USER ROW */}
              {addingUser && (
                <tr>
                  <td>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} />
                  </td>
                  <td>
                    <input type="text" name="username" value={formData.username} onChange={handleChange} />
                  </td>
                  <td>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} />
                  </td>
                  <td>
                    <select name="role" value={formData.role} onChange={handleChange}>
                      <option value="">Select Role</option>
                      <option value="admin">Admin</option>
                      <option value="robot_admin">Robot Admin</option>
                      <option value="robot_operator">Robot Operator</option>
                    </select>
                  </td>
                  <td>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter Password"
                    />
                  </td>
                  <td className="permission-buttons">
                    <button className="approve" onClick={handleAddUser}>
                      <i className="fa-regular fa-floppy-disk"></i>
                    </button>
                    <button className="reject" onClick={handleCancel}>
                      <i className="fa-regular fa-circle-xmark"></i>
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ textAlign: "center", position: "fixed", top: "30px", right: "20px" }}>
        <button
          style={{
            marginTop: "30px",
            background: "#007bff",
            color: "white",
            border: "0",
            outline: "0",
            padding: "5px 10px",
            borderRadius: "4px",
            cursor: "pointer",
          }}
          onClick={() => {
            setAddingUser(true);
            setEditUserId(null);
            resetForm();
          }}
        >
          Add User
        </button>
      </div>

      {error && (
        <div style={{ color: "red", textAlign: "center", marginTop: "20px" }}>
          {error}
        </div>
      )}
    </div>
  );
}
