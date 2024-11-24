import React, { useState, useEffect } from 'react';
import { db } from '../utils/firebase';
import { ref, onValue, push, set, query, orderByChild, serverTimestamp } from 'firebase/database';
import Card from '/src/components/ui/card';
import Button from '/src/components/ui/button';
import Input from '/src/components/ui/input';
import ScrollArea from '/src/components/ui/scroll-area';
import { X, Send, Paperclip, Smile } from 'lucide-react';
import Notification, { notify } from '/src/components/Notification';
import MessageWithAvatar from '/src/components/MessageWithAvatar';
import EmojiPicker from 'emoji-picker-react';

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

  const handleEmojiClick = (event, emojiObject) => {
    setMessage((prevMessage) => prevMessage + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        onSendMessage(reader.result, 'file');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-4 border-t">
      <Button type="button" size="icon" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
        <Smile className="h-4 w-4" />
      </Button>
      {showEmojiPicker && <EmojiPicker onEmojiClick={handleEmojiClick} />}
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

const PrivateChat = ({ currentUser, targetUser, onClose, position = 0 }) => {
  const [messages, setMessages] = useState([]);
  const [chatId, setChatId] = useState(null);
  const [chatVisible, setChatVisible] = useState(false);
  const [lastMessageId, setLastMessageId] = useState(null);
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
          .map(([id, message]) => ({
            id,
            ...message
          }))
          .sort((a, b) => a.timestamp - b.timestamp);
        setMessages(messagesList);

        const lastMessage = messagesList[messagesList.length - 1];
        if (lastMessage && lastMessage.sender !== currentUser) {
          if (lastMessage.id !== lastMessageId) {
            setLastMessageId(lastMessage.id);
            setUnreadMessages((prevMessages) => [...prevMessages, lastMessage.id]);
            notify(`New message from ${lastMessage.sender}`, 'info');
            setChatVisible(true); // Ensure chat is set to visible
          }
        }
      } else {
        setMessages([]);
      }
    }, (error) => {
      console.error('Error loading messages:', error);
      notify('Failed to load messages', 'error');
    });

    const unsubscribeTyping = onValue(typingRef, (snapshot) => {
      setIsTyping(snapshot.val() || false);
    });

    return () => {
      unsubscribeMessages();
      unsubscribeTyping();
    };
  }, [currentUser, targetUser, lastMessageId, chatVisible]);

  const sendPrivateMessage = (text, type = 'text') => {
    const messageRef = ref(db, `privateChats/${chatId}/messages`);
    push(messageRef, {
      text,
      type,
      sender: currentUser,
      receiver: targetUser,
      timestamp: serverTimestamp()
    })
    .catch((error) => {
      console.error('Error sending message:', error);
      notify('Failed to send message', 'error');
    });
  };

  const handleOpenChat = () => {
    setChatVisible(true);
    setUnreadMessages([]); // Reset unread messages when chat is opened
  };

  // Calculate right position based on chat window index
  const rightPosition = 20 + (position * 320); // 320px = width + gap

  return (
    <>
      <Card 
        className={`fixed bottom-20 w-[300px] h-[400px] flex flex-col shadow-lg border-2 border-blue-500 z-50 bg-white rounded-lg overflow-hidden ${chatVisible ? '' : 'hidden'}`}
        style={{ right: `${rightPosition}px` }}
      >
        <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <h3 className="font-medium truncate">
            Chat with {targetUser} 
            {unreadMessages.length > 0 && <span className="ml-2 bg-red-500 text-white px-2 py-1 rounded-full">{unreadMessages.length}</span>}
          </h3>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-blue-400/20"
            onClick={() => { onClose(); setChatVisible(false); setUnreadMessages([]); }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => {
              const isSender = message.sender === currentUser;
              return (
                <MessageWithAvatar 
                  key={message.id}
                  message={message}
                  isSender={isSender}
                />
              );
            })}
            {isTyping && (
              <div className="typingIndicator">
                {`${targetUser} is typing...`}
              </div>
            )}
          </div>
        </ScrollArea>

        <MessageInput onSendMessage={sendPrivateMessage} currentUser={currentUser} chatId={chatId} />
      </Card>

      <Button onClick={handleOpenChat} className="fixed bottom-10 right-10 bg-blue-500 text-white p-2 rounded">
        Open Chat with {targetUser}
      </Button>

      <Notification />
    </>
  );
};

export default PrivateChat;
