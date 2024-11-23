import React, { useState, useEffect, useCallback, memo } from 'react';
import MessageList from './MessageList';
import UserList from './UserList';
import VideoConference from './VideoConference';
import MessageInput from './MessageInput';
import { db } from '../utils/firebase';
import { ref, onValue, push, set, serverTimestamp, off } from 'firebase/database';
import '../styles/components/ChatRoom.css';

// Constants for Firebase paths
const FIREBASE_PATHS = {
  MESSAGES: 'messages',
  USERS: 'users',
};

// Memoized components
const MemoizedMessageList = memo(MessageList);
const MemoizedUserList = memo(UserList);
const MemoizedVideoConference = memo(VideoConference);

const ChatRoom = ({ username }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [showVideo, setShowVideo] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Transform messages data
  const transformMessages = useCallback((messagesData) => {
    if (!messagesData) return [];
    
    return Object.entries(messagesData)
      .map(([id, message]) => ({
        id,
        ...message,
        timestamp: message.timestamp || Date.now(), // Fallback for missing timestamp
      }))
      .sort((a, b) => a.timestamp - b.timestamp);
  }, []);

  // Transform users data
  const transformUsers = useCallback((usersData) => {
    if (!usersData) return [];
    return Object.entries(usersData)
      .filter(([_, userData]) => userData.online)
      .map(([userId]) => userId);
  }, []);

  // Handle user presence
  const handleUserPresence = useCallback(async () => {
    if (!username) return;

    const userRef = ref(db, `${FIREBASE_PATHS.USERS}/${username}`);
    const userStatus = {
      online: true,
      lastSeen: serverTimestamp(),
    };

    try {
      await set(userRef, userStatus);

      // Set up disconnect hook
      window.addEventListener('beforeunload', () => {
        set(userRef, {
          ...userStatus,
          online: false,
        });
      });
    } catch (err) {
      console.error('Error updating user presence:', err);
      setError('Failed to update user status');
    }
  }, [username]);

  useEffect(() => {
    if (!username) {
      setError('Username is required');
      return;
    }

    const messagesRef = ref(db, FIREBASE_PATHS.MESSAGES);
    const usersRef = ref(db, FIREBASE_PATHS.USERS);

    // Set up listeners
    const setupListeners = async () => {
      try {
        // Messages listener
        onValue(messagesRef, (snapshot) => {
          setMessages(transformMessages(snapshot.val()));
          setIsLoading(false);
        }, (error) => {
          console.error('Messages listener error:', error);
          setError('Failed to load messages');
          setIsLoading(false);
        });

        // Users listener
        onValue(usersRef, (snapshot) => {
          setUsers(transformUsers(snapshot.val()));
        }, (error) => {
          console.error('Users listener error:', error);
          setError('Failed to load users');
        });

        // Set up user presence
        await handleUserPresence();
      } catch (err) {
        console.error('Setup error:', err);
        setError('Failed to initialize chat');
        setIsLoading(false);
      }
    };

    setupListeners();

    // Cleanup function
    return () => {
      // Remove listeners
      off(messagesRef);
      off(usersRef);

      // Update user status
      if (username) {
        set(ref(db, `${FIREBASE_PATHS.USERS}/${username}`), {
          online: false,
          lastSeen: serverTimestamp(),
        }).catch(console.error);
      }
    };
  }, [username, transformMessages, transformUsers, handleUserPresence]);

  // Send message handler
  const sendMessage = useCallback(async (text) => {
    if (!text.trim()) return;

    try {
      const messagesRef = ref(db, FIREBASE_PATHS.MESSAGES);
      await push(messagesRef, {
        text: text.trim(),
        username,
        timestamp: serverTimestamp(),
      });
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    }
  }, [username]);

  // Toggle video handler
  const toggleVideo = useCallback(() => {
    setShowVideo(prev => !prev);
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
        <MemoizedUserList users={users} currentUser={username} />
        <div className="chat-main">
          <MemoizedMessageList 
            messages={messages} 
            currentUser={username}
          />
          
            <MessageInput 
              onSendMessage={sendMessage} 
              disabled={!username}
            />
          
        </div>
      </div>
      
      {showVideo && (
        <MemoizedVideoConference 
          username={username} 
          onError={(err) => setError(err.message)}
        />
      )}
      
      <button 
        className="video-toggle-btn"
        onClick={toggleVideo}
        aria-label={showVideo ? 'Hide Video' : 'Show Video'}
      >
        {showVideo ? 'Hide Video' : 'Show Video'}
      </button>
    </div>
  );
};

export default memo(ChatRoom);