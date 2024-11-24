import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../utils/firebase';
import { ref, onValue, push, set, query, orderByChild, serverTimestamp } from 'firebase/database';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Send, Paperclip, Smile } from 'lucide-react';
import Notification from '/src/components/Notification';
import notify from '/src/components/Notification';
import { MessageWithAvatar } from '/src/components/MessageWithAvatar';
import EmojiPicker from 'emoji-picker-react';

const MessageInput = ({ onSendMessage, currentUser, chatId }) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);

  const updateTypingStatus = useCallback((isTyping) => {
    set(ref(db, `privateChats/${chatId}/typing/${currentUser}`), isTyping);
  }, [chatId, currentUser]);

  const handleTyping = (e) => {
    setMessage(e.target.value);
    
    if (typingTimeout) clearTimeout(typingTimeout);
    
    updateTypingStatus(true);
    const timeout = setTimeout(() => updateTypingStatus(false), 2000);
    setTypingTimeout(timeout);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
      updateTypingStatus(false);
      if (typingTimeout) clearTimeout(typingTimeout);
    }
  };

  const handleEmojiClick = (event, emojiObject) => {
    setMessage(prev => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 5 * 1024 * 1024) { // 5MB limit
      const reader = new FileReader();
      reader.onload = () => onSendMessage(reader.result, 'file');
      reader.readAsDataURL(file);
    } else if (file) {
      notify('File size must be less than 5MB', 'error');
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeout) clearTimeout(typingTimeout);
      updateTypingStatus(false);
    };
  }, [typingTimeout, updateTypingStatus]);

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-4 border-t">
      <div className="relative">
        <Button 
          type="button" 
          size="icon"
          variant="ghost" 
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        >
          <Smile className="h-4 w-4" />
        </Button>
        {showEmojiPicker && (
          <div className="absolute bottom-full right-0 z-50">
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
        className="hidden"
        onChange={handleFileChange}
        accept="image/*,.pdf,.doc,.docx"
      />
      
      <Button 
        type="button" 
        size="icon"
        variant="ghost"
        onClick={() => document.getElementById('file-input').click()}
      >
        <Paperclip className="h-4 w-4" />
      </Button>
      
      <Button type="submit" size="icon" variant="default">
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
};

const PrivateChat = ({ currentUser, targetUser, onClose, position = 0 }) => {
  const [messages, setMessages] = useState([]);
  const [chatId, setChatId] = useState(null);
  const [chatVisible, setChatVisible] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const users = [currentUser, targetUser].sort();
    const privateChatId = `private_${users[0]}_${users[1]}`;
    setChatId(privateChatId);

    const chatRef = ref(db, `privateChats/${privateChatId}/messages`);
    const typingRef = ref(db, `privateChats/${privateChatId}/typing/${targetUser}`);
    const messagesQuery = query(chatRef, orderByChild('timestamp'));

    const unsubscribeMessages = onValue(messagesQuery, (snapshot) => {
      const messagesData = snapshot.val();
      if (messagesData) {
        const messagesList = Object.entries(messagesData)
          .map(([id, message]) => ({ id, ...message }))
          .sort((a, b) => a.timestamp - b.timestamp);
          
        setMessages(messagesList);

        const lastMessage = messagesList[messagesList.length - 1];
        if (lastMessage?.sender !== currentUser && !chatVisible) {
          setUnreadMessages(prev => [...prev, lastMessage.id]);
          notify(`New message from ${targetUser}`, 'info');
        }
      }
    });

    const unsubscribeTyping = onValue(typingRef, (snapshot) => {
      setIsTyping(snapshot.val() || false);
    });

    return () => {
      unsubscribeMessages();
      unsubscribeTyping();
    };
  }, [currentUser, targetUser, chatVisible]);

  const sendPrivateMessage = useCallback((text, type = 'text') => {
    const messageRef = ref(db, `privateChats/${chatId}/messages`);
    push(messageRef, {
      text,
      type,
      sender: currentUser,
      receiver: targetUser,
      timestamp: serverTimestamp()
    }).catch(() => notify('Failed to send message', 'error'));
  }, [chatId, currentUser, targetUser]);

  const handleClose = () => {
    onClose();
    setChatVisible(false);
    setUnreadMessages([]);
  };

  const rightPosition = `${20 + (position * 320)}px`;

  return (
    <>
      <Card 
        className={`fixed bottom-20 w-[300px] h-[400px] flex flex-col shadow-lg transition-all duration-300 ease-in-out ${
          chatVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        style={{ right: rightPosition }}
      >
        <CardHeader className="p-4 bg-gradient-to-r from-blue-500 to-blue-600">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-sm font-medium flex items-center gap-2">
              {targetUser}
              {unreadMessages.length > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {unreadMessages.length}
                </span>
              )}
            </CardTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-blue-400/20"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              {messages.map((message) => (
                <MessageWithAvatar 
                  key={message.id}
                  message={message}
                  isSender={message.sender === currentUser}
                />
              ))}
              {isTyping && (
                <div className="text-sm text-gray-500 italic">
                  {targetUser} is typing...
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>

        <MessageInput 
          onSendMessage={sendPrivateMessage}
          currentUser={currentUser}
          chatId={chatId}
        />
      </Card>

      <Button
        onClick={() => {
          setChatVisible(true);
          setUnreadMessages([]);
        }}
        className={`fixed bottom-10 bg-blue-500 hover:bg-blue-600 transition-all duration-300 ${
          chatVisible ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        style={{ right: rightPosition }}
      >
        Chat with {targetUser}
        {unreadMessages.length > 0 && (
          <span className="ml-2 bg-red-500 px-2 py-1 rounded-full text-xs">
            {unreadMessages.length}
          </span>
        )}
      </Button>

      <Notification />
    </>
  );
};

export default PrivateChat;