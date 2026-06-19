import React, { useEffect, useState } from 'react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);

  // Users fetch karne ka function
  const fetchUsers = async () => {
    const res = await fetch("http://localhost:5000/api/users");
    const data = await res.json();
    setUsers(data);
  };

  useEffect(() => { fetchUsers(); }, []);

  // Role badalne ka function
  const handleRoleChange = async (userId, newRole) => {
    const res = await fetch("http://localhost:5000/api/users/update-role", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, newRole }),
    });
    if (res.ok) {
      alert("Role Updated!");
      fetchUsers(); // List refresh karein
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h3>User Management Panel</h3>
      <table border="1" cellPadding="10" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f4f4f4' }}>
            <th>Name</th>
            <th>Email</th>
            <th>Current Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id}>
              <td>{user.fullName}</td>
              <td>{user.email}</td>
              <td><strong>{user.role}</strong></td>
              <td>
                {user.role === 'user' && (
                  <button onClick={() => handleRoleChange(user._id, 'teacher')} style={btnStyle}>Make Teacher</button>
                )}
                {/* Super Admin ke liye extra power (Optional) */}
                {user.role === 'teacher' && (
                  <button onClick={() => handleRoleChange(user._id, 'user')} style={{...btnStyle, background: 'orange'}}>Demote to Student</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const btnStyle = { background: '#28a745', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px' };

export default UserManagement;