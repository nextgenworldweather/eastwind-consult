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
        <h3>Online Users</h3>
        <div className="users">
          {users.map((user, index) => (
            user !== currentUser && (
              <div key={index} className="user-item">
                <div className="user-status-indicator"></div>
                <span className="user-name">{user}</span>
                <button 
                  onClick={() => startPrivateChat(user)}
                  className="private-chat-btn"
                >
                  Message
                </button>
              </div>
            )
          ))}
        </div>
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