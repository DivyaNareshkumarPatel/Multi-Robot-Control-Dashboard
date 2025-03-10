import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle } from "lucide-react";
import {userDetails, handleUserPermissionLogin} from '../api/api'
import '../style/adminDashboard.css';

export default function UserDetails() {
  const [users, setUsers] = useState([]); // State to store users
  const [loading, setLoading] = useState(true); // State to handle loading state
  const [error, setError] = useState(null); // State to handle errors

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Fetch users from the backend
        const response = await userDetails()
        setUsers(response.data); // Set the users in the state
        setLoading(false); // Set loading to false after fetching the data
      } catch (err) {
        setError("Error fetching users");
        setLoading(false);
      }
    };

    fetchUsers(); // Call the fetch function on component mount
  }, []);

  const handlePermission = async (id, action) => {
    try {
      const endpoint = action === "approve" ? "/approve" : "/reject";
      handleUserPermissionLogin({endpoint, id})

      setUsers(users.map(user => user._id === id ? { ...user, status: action === "approve" ? "approved" : "rejected" } : user));
    } catch (err) {
      setError("Error updating permission");
    }
  };

  return (
    <div className="dashboard-content" style={{padding:"20px"}}>
      <h1>User Permissions</h1>
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
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td className="permission-buttons">
                    <button 
                      className="approve" 
                      onClick={() => handlePermission(user._id, "approve")}
                    >
                      <CheckCircle className="icon-check" />
                    </button>
                    <button 
                      className="reject" 
                      onClick={() => handlePermission(user._id, "reject")}
                    >
                      <XCircle className="icon-cross" />
                    </button>
                  </td>
                  <td className={user.status === "pending" ? "pending" : user.status === "approved" ? "approved" : "rejected"}>
                    {user.status === "pending" ? "Pending" : user.status === "approved" ? "Approved" : "Rejected"}
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
