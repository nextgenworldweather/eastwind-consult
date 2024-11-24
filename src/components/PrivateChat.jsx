import React, { useState, useEffect, useRef } from 'react';
import { db, storage } from '/src/utils/firebase';
import { ref, onValue, push, query, orderByChild, serverTimestamp, update } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import Card from '/src/components/ui/card';
import Button from '/src/components/ui/button';
import Input from '/src/components/ui/input';
import ScrollArea from '/src/components/ui/scroll-area';
import { X, Send, Smile, Paperclip } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import Notification, { notify } from '/src/components/Notification';
import MessageWithAvatar from '/src/components/MessageWithAvatar';

const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

const MessageInput = ({ onSendMessage, onFileUpload }) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleEmojiClick = (emojiObject) => {
    setMessage(prev => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        await onFileUpload(file);
      } catch (error) {
        console.error('Error uploading file:', error);
        notify('Failed to upload file', 'error');
      }
    }
  };

  return (
    <div className="relative">
      {showEmojiPicker && (
        <div className="absolute bottom-full mb-2">
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex gap-2 p-4 border-t">
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        >
          <Smile className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => fileInputRef.current?.click()}
        >
          <Paperclip className="h-4 w-4" />
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx"
        />
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
    </div>
  );
};

const PrivateChat = ({ currentUser, targetUser, onClose, position = 0 }) => {
  const [messages, setMessages] = useState([]);
  const [chatId, setChatId] = useState(null);
  const [chatVisible, setChatVisible] = useState(false);

  useEffect(() => {
    const users = [currentUser, targetUser].sort();
    const privateChatId = `private_${users[0]}_${users[1]}`;
    setChatId(privateChatId);

    const chatRef = ref(db, `privateChats/${privateChatId}/messages`);
    const messagesQuery = query(chatRef, orderByChild('timestamp'));

    const unsubscribe = onValue(messagesQuery, (snapshot) => {
      const messagesData = snapshot.val();
      if (messagesData) {
        const messagesList = Object.entries(messagesData).map(([id, message]) => ({
          id,
          ...message,
          reactions: message.reactions || {}
        }));
        setMessages(messagesList);
      } else {
        setMessages([]);
      }
    });

    return () => unsubscribe();
  }, [currentUser, targetUser]);

  const sendPrivateMessage = (text, type = 'text', fileUrl = null) => {
    if (!chatId) return;
    
    const messageRef = ref(db, `privateChats/${chatId}/messages`);
    push(messageRef, {
      text,
      type,
      fileUrl,
      sender: currentUser,
      receiver: targetUser,
      timestamp: serverTimestamp(),
      reactions: {}
    });
  };

  const handleFileUpload = async (file) => {
    const fileRef = storageRef(storage, `chats/${chatId}/${file.name}`);
    await uploadBytes(fileRef, file);
    const downloadUrl = await getDownloadURL(fileRef);
    
    const fileType = file.type.startsWith('image/') ? 'image' : 'file';
    sendPrivateMessage(file.name, fileType, downloadUrl);
  };

  const handleReaction = async (messageId, emoji) => {
    const messageRef = ref(db, `privateChats/${chatId}/messages/${messageId}/reactions/${currentUser}`);
    const currentReaction = messages.find(m => m.id === messageId)?.reactions?.[currentUser];
    
    if (currentReaction === emoji) {
      // Remove reaction
      update(messageRef, null);
    } else {
      // Add or update reaction
      update(messageRef, emoji);
    }
  };

  return (
    <>
      {chatVisible && (
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
              onClick={() => {
                setChatVisible(false);
                onClose();
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="relative group">
                  <MessageWithAvatar 
                    message={message}
                    isSender={message.sender === currentUser}
                  />
                  <div className="reaction-buttons opacity-0 group-hover:opacity-100 absolute top-0 right-0 bg-white shadow-md rounded-lg p-1 flex gap-1">
                    {REACTION_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleReaction(message.id, emoji)}
                        className={`p-1 hover:bg-gray-100 rounded ${
                          message.reactions?.[currentUser] === emoji ? 'bg-blue-100' : ''
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  {Object.entries(message.reactions || {}).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {Object.entries(message.reactions).map(([user, emoji]) => (
                        <span key={`${message.id}-${user}`} className="bg-gray-100 rounded px-1 text-xs">
                          {emoji} {user === currentUser ? 'You' : user}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>

          <MessageInput 
            onSendMessage={sendPrivateMessage}
            onFileUpload={handleFileUpload}
          />
        </Card>
      )}

      <Button 
        onClick={() => setChatVisible(true)}
        className="fixed bottom-10 right-10 bg-blue-500 text-white p-2 rounded"
      >
        Chat with {targetUser}
      </Button>

      <Notification />
    </>
  );
};

export default PrivateChat;