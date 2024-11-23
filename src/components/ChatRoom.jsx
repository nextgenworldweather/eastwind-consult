import React, { useState, useEffect } from 'react';
import MessageList from './MessageList';
import UserList from './UserList';
import VideoConference from './VideoConference';
import MessageInput from './MessageInput';
import { db } from '../utils/firebase';
import { ref, onValue, push, set, serverTimestamp } from 'firebase/database';
import '../styles/components/ChatRoom.css';

const ChatRoom = ({ username }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    // Set up message listener
    const messagesRef = ref(db, 'messages');
    const messagesUnsubscribe = onValue(messagesRef, (snapshot) => {
      const messagesData = snapshot.val();
      if (messagesData) {
        const messagesList = Object.entries(messagesData).map(([id, message]) => ({
          id,
          ...message
        }));
        // Sort messages by timestamp
        messagesList.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        setMessages(messagesList);
      } else {
        setMessages([]);
      }
    });

    // Set up users listener
    const usersRef = ref(db, 'users');
    const usersUnsubscribe = onValue(usersRef, (snapshot) => {
      const usersData = snapshot.val();
      if (usersData) {
        const usersList = Object.keys(usersData);
        setUsers(usersList);
      } else {
        setUsers([]);
      }
    });

    // Add user to online users
    const userRef = ref(db, `users/${username}`);
    set(userRef, {
      online: true,
      lastSeen: serverTimestamp()
    });

    // Cleanup function
    return () => {
      messagesUnsubscribe();
      usersUnsubscribe();
      // Update user status when leaving
      set(userRef, {
        online: false,
        lastSeen: serverTimestamp()
      });
    };
  }, [username]);

  const sendMessage = (text) => {
    const messagesRef = ref(db, 'messages');
    push(messagesRef, {
      text,
      username,
      timestamp: serverTimestamp()
    });
  };

  return (
    <div className="chat-room">
      <div className="chat-container">
        <UserList users={users} />
        <div className="chat-main">
          <MessageList messages={messages} />
        </div>
        <div className="chat-input-container">
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