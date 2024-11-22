import React, { useState } from 'react';
import '../styles/components/UsernameModal.css';

const UsernameModal = ({ onUsernameSubmit }) => {
  const [inputUsername, setInputUsername] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputUsername.trim()) {
      onUsernameSubmit(inputUsername);
    }
  };

  const generateRandomUsername = () => {
    const adjectives = ['Happy', 'Lucky', 'Sunny', 'Cool', 'Swift'];
    const nouns = ['Dolphin', 'Eagle', 'Tiger', 'Fox', 'Wolf'];
    const randomNum = Math.floor(Math.random() * 1000);
    const username = `${adjectives[Math.floor(Math.random() * adjectives.length)]}${
      nouns[Math.floor(Math.random() * nouns.length)]
    }${randomNum}`;
    setInputUsername(username);
  };

  return (
    <div className="username-modal">
      <div className="username-modal-content">
        <h2>Welcome to NextGen Chat</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={inputUsername}
            onChange={(e) => setInputUsername(e.target.value)}
            placeholder="Enter username"
            required
          />
          <button type="submit" className="primary-btn">Join Chat</button>
          <button type="button" onClick={generateRandomUsername} className="secondary-btn">
            Generate Random Username
          </button>
        </form>
      </div>
    </div>
  );
};

export default UsernameModal;