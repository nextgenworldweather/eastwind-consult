import React, { useState, useEffect } from 'react';
import { db } from '../utils/firebase';
import { ref, onValue, push, query, orderByChild, serverTimestamp } from 'firebase/database';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Send } from 'lucide-react';

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
      } else {
        setMessages([]);
      }
    });

    return () => unsubscribe();
  }, [currentUser, targetUser]);

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
    });
  };

  // Calculate right position based on chat window index
  const rightPosition = 20 + (position * 320); // 320px = width + gap

  return (
    <Card 
      className="fixed bottom-20 w-[300px] h-[400px] flex flex-col shadow-lg border-2 border-blue-500 z-50 bg-white rounded-lg overflow-hidden"
      style={{ right: `${rightPosition}px` }}
    >
      <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <h3 className="font-medium truncate">Chat with {targetUser}</h3>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-white hover:bg-blue-400/20"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => {
            const isSender = message.sender === currentUser;
            return (
              <div 
                key={message.id}
                className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`
                    max-w-[80%] rounded-lg px-4 py-2 
                    ${isSender ? 
                      'bg-blue-500 text-white' : 
                      'bg-gray-100 text-gray-900'
                    }
                  `}
                >
                  <div className="break-words">{message.text}</div>
                  <div 
                    className={`
                      text-xs mt-1
                      ${isSender ? 'text-blue-100' : 'text-gray-500'}
                    `}
                  >
                    {message.timestamp ? 
                      new Date(message.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 
                      'Sending...'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <MessageInput onSendMessage={sendPrivateMessage} />
    </Card>
  );
};

export default PrivateChat;