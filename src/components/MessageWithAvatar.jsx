import React from 'react';
import Avatar from 'react-avatar';
import moment from 'moment';
import '/src/styles/components/MessageWithAvatar.css';

const MessageWithAvatar = ({ message, isSender }) => {
  const formatTimestamp = (timestamp) => {
    return moment(timestamp).fromNow();
  };

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
            ? formatTimestamp(message.timestamp)
            : 'Sending...'}
        </div>
      </div>
    </div>
  );
};

export default MessageWithAvatar;
