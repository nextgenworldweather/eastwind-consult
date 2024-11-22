import React, { useEffect, useRef } from 'react';
import '../styles/components/MessageList.css';

const MessageList = ({ messages }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="message-list">
      {messages.map((message, index) => (
        <div key={index} className="message">
          <div className="message-header">
            <span className="username">{message.username}</span>
            <span className="timestamp">
              {new Date(message.timestamp).toLocaleTimeString()}
            </span>
          </div>
          <div className="message-content">{message.text}</div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;