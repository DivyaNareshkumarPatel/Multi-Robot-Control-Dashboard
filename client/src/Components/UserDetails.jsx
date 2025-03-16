import React, { useState, useEffect } from 'react';
import { userDetails, handleUserPermissionLogin } from '../api/api';
import '../style/adminDashboard.css';

export default function UserDetails() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const handlePermission = async (id, action) => {
    try {
      const endpoint = action === "approve" ? "/approve" : "/reject";
      handleUserPermissionLogin({ endpoint, id });

      setUsers(users.map(user =>
        user._id === id ? { ...user, status: action === "approve" ? "approved" : "rejected" } : user
      ));
    } catch (err) {
      setError("Error updating permission");
    }
  };

  return (
    <div className="dashboard-content" style={{ paddingLeft: "20px", paddingRight: "20px" }}>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <div className="table-container">
          <table className="user-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.username}</td> {/* Displaying Username */}
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td className="permission-buttons">
                    <button
                      className="approve"
                      onClick={() => handlePermission(user._id, "approve")}
                    >
                      <i className="fa-regular fa-circle-check"></i>
                    </button>
                    <button
                      className="reject"
                      onClick={() => handlePermission(user._id, "reject")}
                    >
                      <i className="fa-regular fa-circle-xmark"></i>
                    </button>
                  </td>
                  <td className={user.status}>
                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
