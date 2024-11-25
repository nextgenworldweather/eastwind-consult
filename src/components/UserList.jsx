import React from 'react';
import '../styles/components/UserList.css';

const UserList = ({ users, currentUser }) => {
  return (
    <div className="user-list">
      <h4>Active Users</h4>
      <ul>
        {users.map((user) => (
          <li key={user} className={user === currentUser ? 'current-user' : ''}>
            {user}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;
