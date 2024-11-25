import React from 'react';
import '../styles/components/UserList.css';

const UserList = ({ users, currentUser, onUserClick }) => {
  return (
    <div className="user-list">
      <h4>Active Users</h4>
      <ul>
        {users.map((user) => (
          <li
            key={user.username}
            className={user.username === currentUser ? 'current-user' : ''}
            onClick={() => onUserClick(user.username)}
          >
            {user.username} {user.online ? '🟢' : '🔴'}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;
