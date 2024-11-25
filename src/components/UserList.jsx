import React, { useState } from 'react';
import PrivateChat from './PrivateChat';
import '../styles/components/UserList.css';

const UserList = ({ users, currentUser }) => {
  const [selectedUser, setSelectedUser] = useState(null);

  const startPrivateChat = (username) => {
    setSelectedUser(username);
  };

  return (
    <div className="user-list-container">
      <div className="user-list">
        <h3>Active Users</h3>
        <ul>
          {users
            .filter(username => username !== currentUser)
            .map((username) => (
              <li
                key={username}
                onClick={() => startPrivateChat(username)}
              >
                <span className="user-status-indicator online">🟢</span>
                <span className="user-name">{username}</span>
              </li>
            ))}
        </ul>
      </div>
      {selectedUser && (
        <PrivateChat
          currentUser={currentUser}
          targetUser={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
};

export default UserList;