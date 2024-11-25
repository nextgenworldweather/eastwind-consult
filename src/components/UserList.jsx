import React, { useState } from 'react';
import PrivateChat from './PrivateChat';
import '/src/styles/components/UserList.css';

const UserList = ({ users, currentUser }) => {
  const [selectedUser, setSelectedUser] = useState(null);

  console.log('Users:', users); // Debug: log all users
  console.log('Current User:', currentUser); // Debug: log current user

  const startPrivateChat = (user) => {
    setSelectedUser(user);
  };

  return (
    <div className="user-list-container">
      <div className="user-list">
        <h3>Active Users</h3>
        <ul>
          {users.map((user) => {
            console.log('Individual User:', user); // Debug: log each user
            return (
              <li
                key={user.id || user.username} // Use id if available
                onClick={() => startPrivateChat(user)}
              >
                <span 
                  className={`user-status-indicator ${user.online === true ? 'online' : 'offline'}`}
                >
                  {user.online === true ? '🟢' : '🔴'}
                </span>
                <span className="user-name">
                  {user.username || 'Unknown User'}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
      {selectedUser && (
        <PrivateChat
          currentUser={currentUser}
          targetUser={selectedUser.username}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
};

export default UserList;