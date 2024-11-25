import React, { useState, useEffect, useCallback, memo } from 'react';
import MessageList from './MessageList';
import UserList from './UserList';
import VideoConference from './VideoConference';
import MessageInput from './MessageInput';
import PrivateChat from './PrivateChat';
import { db } from '../utils/firebase';
import { ref, onValue, push, set, serverTimestamp, off } from 'firebase/database';
import Notification from './Notification';
import '../styles/components/ChatRoom.css';

const ChatRoom = ({ username }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [showVideo, setShowVideo] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const transformMessages = useCallback((messagesData) => {
    if (!messagesData) return [];
    return Object.entries(messagesData).map(([id, message]) => ({
      id,
      ...message,
      timestamp: message.timestamp || Date.now(),
    }));
  }, []);

  const transformUsers = useCallback((usersData) => {
    if (!usersData) return [];
    return Object.entries(usersData).filter(([_, user]) => user.online).map(([id]) => id);
  }, []);

  useEffect(() => {
    const messagesRef = ref(db, 'messages');
    const usersRef = ref(db, 'users');

    const setupListeners = () => {
      onValue(messagesRef, (snapshot) => {
        setMessages(transformMessages(snapshot.val()));
        setIsLoading(false);
      }, (error) => {
        console.error('Error loading messages:', error);
        setError('Failed to load messages');
      });

      onValue(usersRef, (snapshot) => {
        setUsers(transformUsers(snapshot.val()));
      }, (error) => {
        console.error('Error loading users:', error);
        setError('Failed to load users');
      });
    };

    setupListeners();

    return () => {
      off(messagesRef);
      off(usersRef);
    };
  }, [transformMessages, transformUsers]);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim()) return;
    try {
      const messagesRef = ref(db, 'messages');
      await push(messagesRef, {
        text: text.trim(),
        username,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    }
  }, [username]);

  const toggleVideo = useCallback(() => {
    setShowVideo((prev) => !prev);
  }, []);

  if (error) {
    return (
      <div className="chat-room-error">
        <p>Error: {error}</p>
        <button onClick={() => setError(null)}>Retry</button>
      </div>
    );
  }

  if (isLoading) {
    return <div className="chat-room-loading">Loading...</div>;
  }

  return (
    <div className="chat-room">
      <div className="chat-container">
        <UserList users={users} currentUser={username} />
        <div className="chat-main">
          <MessageList messages={messages} currentUser={username} />
          <MessageInput onSendMessage={sendMessage} />
        </div>
      </div>
      {showVideo && <VideoConference username={username} />}
      <button className="video-toggle-btn" onClick={toggleVideo}>
        {showVideo ? 'Hide Video' : 'Show Video'}
      </button>
      <Notification />
    </div>
  );
};

export default memo(ChatRoom);
