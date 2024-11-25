import React, { useState } from 'react';
import PrivateChat from './PrivateChat';
import '../styles/components/UserList.css';

const UserList = ({ users, currentUser }) => {
  const [selectedUser, setSelectedUser] = useState(null);

  const startPrivateChat = (user) => {
    setSelectedUser(user);
  };

  return (
    <div className="user-list-container">
      <div className="user-list">
        <h3>Active Users</h3>
        <ul>
          {users
            .filter(user => user.username !== currentUser)
            .map((user) => (
              <li
                key={user.username}
                onClick={() => startPrivateChat(user)}
              >
                <span className={`user-status-indicator ${user.online ? 'online' : 'offline'}`}>
                  {user.online ? '🟢' : '🔴'}
                </span>
                <span className="user-name">{user.username}</span>
              </li>
            ))}
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