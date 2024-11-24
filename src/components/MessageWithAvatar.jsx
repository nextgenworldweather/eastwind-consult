import React from 'react';
import Avatar from 'react-avatar';
import '/src/styles/components/MessageWithAvatar.css';

const MessageWithAvatar = ({ message, isSender }) => {
  return (
    <div className={`message ${isSender ? 'isSender' : ''}`}>
      {!isSender && (
        <Avatar 
          name={message.sender} 
          size="40" 
          round={true} 
          className="avatar"
        />
      )}
      <div
        className={`messageContent ${isSender ? 'sender' : 'receiver'}`}
      >
        <div className="break-words">{message.text}</div>
        <div className="timestamp">
          {message.timestamp
            ? new Date(message.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })
            : 'Sending...'}
        </div>
      </div>
    </div>
  );
};

export default MessageWithAvatar;
