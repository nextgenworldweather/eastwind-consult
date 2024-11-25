import React, { useState } from 'react';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Smile, Send, Paperclip } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import Button from '/src/components/ui/button';
import Input from '/src/components/ui/input';

const MessageInput = ({ onSendMessage, currentUser, chatId }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleTyping = (e) => {
    setMessage(e.target.value);
    if (!isTyping) {
      setIsTyping(true);
    }
    if (e.target.value === '') {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage({ text: message.trim(), type: 'text' });
      setMessage('');
      setIsTyping(false);
    }
  };

  const handleEmojiClick = (event, emojiObject) => {
    const emoji = emojiObject.emoji || emojiObject.native || event.target.innerText;
    if (emoji) {
      setMessage((prevMessage) => prevMessage + emoji);
    } else {
      console.error('Failed to append emoji:', emojiObject);
    }
    setShowEmojiPicker(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const storageReference = storageRef(storage, `uploads/${file.name}`);
      uploadBytes(storageReference, file)
        .then((snapshot) => {
          getDownloadURL(snapshot.ref)
            .then((url) => {
              onSendMessage({
                text: file.name,
                fileUrl: url,
                type: 'file',
              });
            })
            .catch((error) => {
              console.error('Error getting download URL:', error);
            });
        })
        .catch((error) => {
          console.error('Error uploading file:', error);
        });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-4 border-t">
      <div style={{ position: 'relative' }}>
        <Button type="button" size="icon" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
          <Smile className="h-4 w-4" />
        </Button>
        {showEmojiPicker && (
          <div style={{ position: 'absolute', bottom: '100%' }}>
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        )}
      </div>
      <Input
        value={message}
        onChange={handleTyping}
        placeholder="Type your message..."
        className="flex-1"
      />
      <input
        type="file"
        id="file-input"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <Button type="button" size="icon" onClick={() => document.getElementById('file-input').click()}>
        <Paperclip className="h-4 w-4" />
      </Button>
      <Button type="submit" size="icon">
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
};

export default MessageInput;
