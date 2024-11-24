import React, { useState } from 'react';
import { ref, set } from 'firebase/database';
import EmojiPicker from 'emoji-picker-react';
import Button from '/src/components/ui/button';
import Input from '/src/components/ui/input';
import { Send, Paperclip, Smile } from 'lucide-react';

const MessageInput = ({ onSendMessage, currentUser, chatId }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleTyping = (e) => {
    setMessage(e.target.value);
    if (!isTyping) {
      setIsTyping(true);
      set(ref(db, `privateChats/${chatId}/typing/${currentUser}`), true);
    }
    if (e.target.value === '') {
      setIsTyping(false);
      set(ref(db, `privateChats/${chatId}/typing/${currentUser}`), false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
      setIsTyping(false);
      try {
        await set(ref(db, `privateChats/${chatId}/typing/${currentUser}`), false);
      } catch (error) {
        console.error('Error updating typing status:', error);
      }
    }
  };

  const handleEmojiClick = (event, emojiObject) => {
    setMessage((prevMessage) => prevMessage + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB.');
        return;
      }
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        alert('Unsupported file type.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        onSendMessage({
          text: file.name,
          fileUrl: reader.result,
          type: 'file',
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-4 border-t">
      <div style={{ position: 'relative' }}>
        <Button
          type="button"
          size="icon"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          aria-label="Open Emoji Picker"
        >
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
      <Button
        type="button"
        size="icon"
        onClick={() => document.getElementById('file-input').click()}
        aria-label="Attach File"
      >
        <Paperclip className="h-4 w-4" />
      </Button>
      <Button type="submit" size="icon" disabled={!message.trim()} aria-label="Send Message">
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
};

export default MessageInput;
