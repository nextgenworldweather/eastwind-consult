import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ref, set } from 'firebase/database';
import EmojiPicker from 'emoji-picker-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Paperclip, Smile, X } from 'lucide-react';
import { db } from '../utils/firebase';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

const MessageInput = ({ onSendMessage, currentUser, chatId }) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  const updateTypingStatus = useCallback((isTyping) => {
    if (!chatId || !currentUser) return;
    set(ref(db, `privateChats/${chatId}/typing/${currentUser}`), isTyping);
  }, [chatId, currentUser]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      updateTypingStatus(false);
    };
  }, [updateTypingStatus]);

  const handleTyping = useCallback((e) => {
    const value = e.target.value;
    setMessage(value);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (value) {
      updateTypingStatus(true);
      typingTimeoutRef.current = setTimeout(() => {
        updateTypingStatus(false);
      }, 2000);
    } else {
      updateTypingStatus(false);
    }
  }, [updateTypingStatus]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage({ text: message.trim(), type: 'text' });
      setMessage('');
      updateTypingStatus(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  }, [message, onSendMessage, updateTypingStatus]);

  const handleEmojiClick = useCallback((_, emojiObject) => {
    setMessage(prev => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  }, []);

  const validateFile = useCallback((file) => {
    if (!file) return { isValid: false, error: 'No file selected.' };
    if (file.size > MAX_FILE_SIZE) {
      return { isValid: false, error: 'File size must be less than 5MB.' };
    }
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return { isValid: false, error: 'Invalid file type. Please upload an image, PDF, or Word document.' };
    }
    return { isValid: true };
  }, []);

  const handleFileChange = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateFile(file);
    if (!validation.isValid) {
      alert(validation.error);
      return;
    }

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = () => {
        onSendMessage({
          text: file.name,
          fileUrl: reader.result,
          type: 'file',
          fileType: file.type,
          fileSize: file.size
        });
        setIsUploading(false);
      };
      reader.onerror = () => {
        alert('Error reading file');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      alert('Error uploading file');
      setIsUploading(false);
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onSendMessage, validateFile]);

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-4 border-t relative">
      <div className="relative">
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="hover:bg-gray-100"
        >
          <Smile className="h-4 w-4" />
        </Button>
        {showEmojiPicker && (
          <div className="absolute bottom-full right-0 mb-2 z-50">
            <div className="relative">
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-2 top-2 hover:bg-gray-100"
                onClick={() => setShowEmojiPicker(false)}
              >
                <X className="h-4 w-4" />
              </Button>
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                searchPlaceholder="Search emoji..."
              />
            </div>
          </div>
        )}
      </div>

      <Input
        value={message}
        onChange={handleTyping}
        placeholder="Type your message..."
        className="flex-1"
        disabled={isUploading}
      />

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
        accept={ALLOWED_FILE_TYPES.join(',')}
        disabled={isUploading}
      />

      <Button
        type="button"
        size="icon"
        variant="ghost"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="hover:bg-gray-100"
      >
        <Paperclip className="h-4 w-4" />
      </Button>

      <Button
        type="submit"
        size="icon"
        variant="default"
        disabled={isUploading || !message.trim()}
        className="bg-blue-500 hover:bg-blue-600 text-white"
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
};

export default MessageInput;