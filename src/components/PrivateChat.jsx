import React, { useState, useEffect } from 'react';
import { db } from '../utils/firebase';
import { ref, onValue, push, query, orderByChild, serverTimestamp } from 'firebase/database';
import Card from '/src/components/ui/card';
import Button from '/src/components/ui/button';
import Input from '/src/components/ui/input';
import ScrollArea from '/src/components/scroll-area';
import { X, Send } from 'lucide-react';
import Notification, { notify } from '/src/components/Notification';
import MessageWithAvatar from '/src/components/MessageWithAvatar';

const MessageInput = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-4 border-t">
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
        className="flex-1"
      />
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
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const users = [currentUser, targetUser].sort();
    const privateChatId = `private_${users[0]}_${users[1]}`;
    setChatId(privateChatId);

    const chatRef = ref(db, `privateChats/${privateChatId}/messages`);
    const messagesQuery = query(chatRef, orderByChild('timestamp'));

    const unsubscribe = onValue(messagesQuery, (snapshot) => {
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
            console.log('New message received:', lastMessage);
            setLastMessageId(lastMessage.id);
            notify(`New message from ${lastMessage.sender}`, 'info');
            setChatVisible(true); // Ensure chat is set to visible
            setUnreadCount((prevCount) => prevCount + 1); // Increment unread count
          }
        }
      } else {
        setMessages([]);
      }
    }, (error) => {
      console.error('Error loading messages:', error);
      notify('Failed to load messages', 'error');
    });

    return () => unsubscribe();
  }, [currentUser, targetUser, lastMessageId, chatVisible]);

  const sendPrivateMessage = (text) => {
    const messageRef = ref(db, `privateChats/${chatId}/messages`);
    push(messageRef, {
      text,
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
    console.log('Chat manually opened');
    setChatVisible(true);
    setUnreadCount(0); // Reset unread count when chat is opened
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
            {unreadCount > 0 && <span className="ml-2 bg-red-500 text-white px-2 py-1 rounded-full">{unreadCount}</span>}
          </h3>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-blue-400/20"
            onClick={() => { onClose(); setChatVisible(false); setUnreadCount(0); }}
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
          </div>
        </ScrollArea>

        <MessageInput onSendMessage={sendPrivateMessage} />
      </Card>

      <Button onClick={handleOpenChat} className="fixed bottom-10 right-10 bg-blue-500 text-white p-2 rounded">
        Open Chat with {targetUser}
      </Button>

      <Notification />
    </>
  );
};

export default PrivateChat;
