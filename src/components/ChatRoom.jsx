import React, { useState, useEffect, useCallback, memo } from 'react';
import MessageList from './MessageList';
import UserList from './UserList';
import VideoConference from './VideoConference';
import MessageInput from './MessageInput';
import PrivateChat from './PrivateChat';
import { db } from '../utils/firebase';
import { ref, onValue, push, set, serverTimestamp, off, query, orderByChild } from 'firebase/database';
import Notification, { notify } from './Notification';
import { Video } from 'lucide-react'; 
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
  const [privateChats, setPrivateChats] = useState(new Map());
  const [unreadMessages, setUnreadMessages] = useState([]);

  // Transform messages data
  const transformMessages = useCallback((messagesData) => {
    if (!messagesData) return [];
    
    return Object.entries(messagesData)
      .map(([id, message]) => ({
        id,
        ...message,
        timestamp: message.timestamp || Date.now(),
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

  // Handle private chat
  const openPrivateChat = useCallback((targetUser) => {
    setPrivateChats(prev => new Map(prev).set(targetUser, true));
  }, []);

  const closePrivateChat = useCallback((targetUser) => {
    setPrivateChats(prev => {
      const newChats = new Map(prev);
      newChats.delete(targetUser);
      return newChats;
    });
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

    const setupListeners = async () => {
      try {
        onValue(messagesRef, (snapshot) => {
          const transformedMessages = transformMessages(snapshot.val());
          setMessages(transformedMessages);
          setIsLoading(false);

          // Update unread messages
          const lastMessage = transformedMessages[transformedMessages.length - 1];
          if (lastMessage && lastMessage.sender !== username) {
            const unreadMessageId = lastMessage.id;
            if (!unreadMessages.includes(unreadMessageId)) {
              setUnreadMessages((prevMessages) => [...prevMessages, unreadMessageId]);
              if (lastMessage.sender) {
                notify(`New message from ${lastMessage.sender}`, 'info');
              }
            }
          }
        }, (error) => {
          console.error('Messages listener error:', error);
          setError('Failed to load messages');
          setIsLoading(false);
        });

        onValue(usersRef, (snapshot) => {
          setUsers(transformUsers(snapshot.val()));
        }, (error) => {
          console.error('Users listener error:', error);
          setError('Failed to load users');
        });

        await handleUserPresence();
      } catch (err) {
        console.error('Setup error:', err);
        setError('Failed to initialize chat');
        setIsLoading(false);
      }
    };

    setupListeners();

    return () => {
      off(messagesRef);
      off(usersRef);

      if (username) {
        set(ref(db, `${FIREBASE_PATHS.USERS}/${username}`), {
          online: false,
          lastSeen: serverTimestamp(),
        }).catch(console.error);
      }
    };
  }, [username, transformMessages, transformUsers, handleUserPresence, unreadMessages]);

  // Send message handler
  const sendMessage = useCallback(async (text, type = 'text') => {
    if (!text.trim()) return;

    try {
      const messagesRef = ref(db, FIREBASE_PATHS.MESSAGES);
      await push(messagesRef, {
        text: text.trim(),
        type,
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
        <MemoizedUserList 
          users={users} 
          currentUser={username} 
          onStartPrivateChat={openPrivateChat}
        />
        <div className="chat-main">
          <MemoizedMessageList 
            messages={messages} 
            currentUser={username}
            unreadMessages={unreadMessages}
          />
          <MessageInput 
            onSendMessage={sendMessage} 
            currentUser={username}
            chatId="chatroom"
          />
        </div>
      </div>
      
      {showVideo && (
        <MemoizedVideoConference 
          username={username} 
          onError={(err) => setError(err.message)}
        />
      )}

      {/* Move the show video button to the left side of the emoji button */}
      <div style={{ position: 'relative', display: 'inline-block', marginRight: '8px' }}>
        <Button type="button" size="icon" onClick={toggleVideo}>
          <Video className="h-4 w-4" />
        </Button>
      </div>

      <Notification />
    </div>
  );
};

export default memo(ChatRoom);
