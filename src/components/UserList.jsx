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
          {users.map((user, index) => (
            user.username !== currentUser && (
              <li
                key={user.username}
                className={user.username === currentUser ? 'current-user' : ''}
                onClick={() => startPrivateChat(user.username)}
              >
                {user.username} {user.online ? '🟢' : '🔴'}
              </li>
            )
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
