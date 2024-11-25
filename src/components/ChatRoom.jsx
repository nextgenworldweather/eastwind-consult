import React, { useState, useEffect } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import UserList from './UserList';
import '../styles/components/ChatRoom.css';
import { db } from '../firebase'; // Adjust based on your project structure
import { ref, onValue, push, update } from 'firebase/database';

const ChatRoom = ({ username }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [privateChatUser, setPrivateChatUser] = useState(null);

  // Fetch messages
  useEffect(() => {
    const messagesRef = ref(database, 'messages');
    onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      const loadedMessages = data
        ? Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }))
        : [];
      setMessages(loadedMessages);
    });
  }, []);

  // Fetch users
  useEffect(() => {
    const usersRef = ref(database, 'users');
    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      const loadedUsers = data
        ? Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }))
        : [];
      setUsers(loadedUsers);
    });
  }, []);

  // Handle sending messages
  const handleSendMessage = (text) => {
    const newMessage = {
      username,
      text,
      timestamp: Date.now(),
    };
    const messagesRef = ref(database, 'messages');
    push(messagesRef, newMessage);
  };

  // Handle private chat
  const handleUserClick = (clickedUser) => {
    if (clickedUser !== username) {
      setPrivateChatUser(clickedUser);
    }
  };

  const closePrivateChat = () => {
    setPrivateChatUser(null);
  };

  return (
    <div className="chat-room">
      <div className="sidebar">
        <UserList
          users={users}
          currentUser={username}
          onUserClick={handleUserClick}
        />
      </div>
      <div className="chat-area">
        {privateChatUser ? (
          <div className="private-chat">
            <h4>Private Chat with {privateChatUser}</h4>
            <button onClick={closePrivateChat}>Close</button>
            {/* Placeholder: Private Chat Messages */}
          </div>
        ) : (
          <>
            <MessageList messages={messages} />
            <MessageInput onSendMessage={handleSendMessage} />
          </>
        )}
      </div>
    </div>
  );
};

export default ChatRoom;
