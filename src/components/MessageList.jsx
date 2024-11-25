import React, { useEffect, useRef } from 'react';
import MessageWithAvatar from './MessageWithAvatar';
import '../styles/components/MessageList.css';

const MessageList = ({ messages, currentUser }) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="message-list">
      {messages.map((message) => (
        <MessageWithAvatar 
          key={message.id}
          message={message}
          isSender={message.username === currentUser}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
