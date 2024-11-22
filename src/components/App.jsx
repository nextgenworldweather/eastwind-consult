import React, { useState } from 'react';
import ChatRoom from './ChatRoom';
import UsernameModal from './UsernameModal';
import '../styles/components/App.css';

const App = () => {
  const [username, setUsername] = useState('');

  return (
    <div className="app">
      {!username ? (
        <UsernameModal onUsernameSubmit={setUsername} />
      ) : (
        <ChatRoom username={username} />
      )}
    </div>
  );
};

export default App;