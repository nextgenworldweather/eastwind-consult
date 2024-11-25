import React from 'react';
import MessageWithAvatar from './MessageWithAvatar';
import '../styles/components/MessageList.css';

const MessageList = ({ messages, currentUser }) => {
  return (
    <div className="message-list">
      {messages.map((message) => (
        <MessageWithAvatar 
          key={message.id}
          message={message}
          isSender={message.username === currentUser}
        />
      ))}
    </div>
  );
};

export default MessageList;
