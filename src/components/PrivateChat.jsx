import React, { useState, useEffect } from 'react';
import { db } from '../utils/firebase';
import { ref, onValue, push, get, query, orderByChild, serverTimestamp } from 'firebase/database';
import MessageInput from './MessageInput';

const PrivateChat = ({ currentUser, targetUser, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [chatId, setChatId] = useState(null);

  useEffect(() => {
    // Create a unique chat ID for the private conversation
    const users = [currentUser, targetUser].sort();
    const privateChatId = `private_${users[0]}_${users[1]}`;
    setChatId(privateChatId);

    // Listen for messages
    const chatRef = ref(db, `privateChats/${privateChatId}/messages`);
    const messagesQuery = query(chatRef, orderByChild('timestamp'));
    
    const unsubscribe = onValue(messagesQuery, (snapshot) => {
      const messagesData = snapshot.val();
      if (messagesData) {
        const messagesList = Object.entries(messagesData).map(([id, message]) => ({
          id,
          ...message
        }));
        setMessages(messagesList);
      }
    });

    return () => unsubscribe();
  }, [currentUser, targetUser]);

  const sendPrivateMessage = (text) => {
    const messageRef = ref(db, `privateChats/${chatId}/messages`);
    push(messageRef, {
      text,
      sender: currentUser,
      receiver: targetUser,
      timestamp: serverTimestamp()
    });
  };

  return (
    <div className="private-chat">
      <div className="private-chat-header">
        <h3>Chat with {targetUser}</h3>
        <button onClick={onClose}>×</button>
      </div>
      <div className="private-chat-messages">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`private-message ${message.sender === currentUser ? 'sent' : 'received'}`}
          >
            <div className="message-content">{message.text}</div>
            <div className="message-time">
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>
      <MessageInput onSendMessage={sendPrivateMessage} />
    </div>
  );
};

export default PrivateChat;