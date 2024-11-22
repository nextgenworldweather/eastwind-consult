import React from 'react';
import '../styles/components/UserList.css';

const UserList = ({ users }) => {
  return (
    <div className="user-list">
      <h3>Online Users</h3>
      <div className="users">
        {users.map((user, index) => (
          <div key={index} className="user-item">
            <div className="user-status-indicator"></div>
            <span className="user-name">{user}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserList;