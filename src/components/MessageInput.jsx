import React, { useState } from 'react';
import { Picker } from 'emoji-mart';
import 'emoji-mart/css/emoji-mart.css';
import '../styles/components/MessageInput.css';

const MessageInput = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const addEmoji = (emoji) => {
    setMessage((prev) => prev + emoji.native);
  };

  return (
    <div className="message-input">
      <button
        className="emoji-btn"
        onClick={() => setShowEmojiPicker((prev) => !prev)}
      >
        😊
      </button>
      {showEmojiPicker && (
        <Picker
          onSelect={addEmoji}
          style={{ position: 'absolute', bottom: '60px', left: '10px' }}
        />
      )}
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message here..."
        className="message-input-field"
      />
      <label className="file-upload-label">
        📎
        <input type="file" className="file-upload-input" />
      </label>
      <button onClick={handleSend} className="send-button">
        Send
      </button>
    </div>
  );
};

export default MessageInput;
