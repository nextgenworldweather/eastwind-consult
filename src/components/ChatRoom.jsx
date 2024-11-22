import React, { useState, useEffect } from 'react';
import MessageList from './MessageList';
import UserList from './UserList';
import VideoConference from './VideoConference';
import MessageInput from './MessageInput';
import { db } from '../utils/firebase';
import { ref, onValue, push, set } from 'firebase/database';
import '../styles/components/ChatRoom.css';

const ChatRoom = ({ username }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    const messagesRef = ref(db, 'messages');
    const usersRef = ref(db, 'users');

    // Add user to online users
    const userRef = ref(db, `users/${username}`);
    set(userRef, { online: true, lastSeen: new Date().toISOString() });

    // Remove user when disconnected
    return () => {
      set(userRef, null);
    };
  }, [username]);

  const sendMessage = (text) => {
    const messagesRef = ref(db, 'messages');
    push(messagesRef, {
      text,
      username,
      timestamp: new Date().toISOString()
    });
  };

  return (
    <div className="chat-room">
      <div className="chat-container">
        <UserList users={users} />
        <div className="chat-main">
          <MessageList messages={messages} />
          <MessageInput onSendMessage={sendMessage} />
        </div>
      </div>
      {showVideo && <VideoConference username={username} />}
      <button 
        className="video-toggle-btn"
        onClick={() => setShowVideo(!showVideo)}
      >
        {showVideo ? 'Hide Video' : 'Show Video'}
      </button>
    </div>
  );
};

export default ChatRoom;
