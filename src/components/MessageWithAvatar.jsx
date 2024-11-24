import React, { useState } from 'react';
import Avatar from 'react-avatar';
import moment from 'moment';
import { Picker } from 'emoji-mart';
import 'emoji-mart/css/emoji-mart.css';
import Button from '/src/components/ui/button';
import { Smile } from 'lucide-react';
import '/src/styles/components/MessageWithAvatar.css';

const MessageWithAvatar = ({ message, isSender, onReact }) => {
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  const formatTimestamp = (timestamp) => {
    return moment(timestamp).fromNow();
  };

  const handleReaction = (emoji) => {
    setShowReactionPicker(false);
    onReact(message.id, emoji.native);
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
      <div className={`messageContent ${isSender ? 'sender' : 'receiver'}`}>
        <div className="break-words">{message.text}</div>
        {message.reactions && (
          <div className="reactions">
            {message.reactions.map((reaction, index) => (
              <span key={index} className="reaction">{reaction}</span>
            ))}
          </div>
        )}
        <div className="timestamp">
          {message.timestamp
            ? formatTimestamp(message.timestamp)
            : 'Sending...'}
        </div>
      </div>
      <Button type="button" onClick={() => setShowReactionPicker(!showReactionPicker)}>
        <Smile className="h-4 w-4" />
      </Button>
      {showReactionPicker && (
        <div className="absolute bottom-12 left-0 z-10">
          <Picker onSelect={handleReaction} />
        </div>
      )}
    </div>
  );
};

export default MessageWithAvatar;
