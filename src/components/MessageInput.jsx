import React, { useState } from 'react';
import { Picker } from 'emoji-mart';
import 'emoji-mart/css/emoji-mart.css';
import Button from '/src/components/ui/button';
import Input from '/src/components/ui/input';
import { Send, Smile } from 'lucide-react';

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
      setIsTyping(false);
      set(ref(db, `privateChats/${chatId}/typing/${currentUser}`), false);
    }
  };

  const addEmoji = (emoji) => {
    setMessage(message + emoji.native);
    setShowEmojiPicker(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onSendMessage({ file });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-4 border-t">
      <div className="relative">
        <Button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
          <Smile className="h-5 w-5" />
        </Button>
        {showEmojiPicker && (
          <div className="absolute bottom-12 left-0 z-10">
            <Picker onSelect={addEmoji} />
          </div>
        )}
      </div>
      <Input
        value={message}
        onChange={handleTyping}
        placeholder="Type your message..."
        className="flex-1"
      />
      <input type="file" onChange={handleFileChange} className="hidden" id="fileInput" />
      <Button type="submit" size="icon">
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
};

export default MessageInput;
