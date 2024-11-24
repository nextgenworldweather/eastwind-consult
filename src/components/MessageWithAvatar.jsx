// MessageWithAvatar.jsx
import React from 'react';
import Avatar from 'react-avatar';
import moment from 'moment';

export function MessageWithAvatar({ message, isSender }) {
  const renderMessageContent = () => {
    switch (message.type) {
      case 'image':
        return (
          <img 
            src={message.fileUrl} 
            alt={message.text}
            className="max-w-[200px] rounded-lg"
          />
        );
      case 'file':
        return (
          <a 
            href={message.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-blue-500 hover:underline"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            {message.text}
          </a>
        );
      default:
        return <div className="break-words">{message.text}</div>;
    }
  };

  const formatTimestamp = (timestamp) => {
    return moment(timestamp).fromNow();
  };

  const messageContainerClass = `flex items-start gap-2 px-4 py-2 ${
    isSender ? 'flex-row-reverse' : ''
  }`;

  const messageContentClass = `max-w-[70%] rounded-lg px-3 py-2 ${
    isSender 
      ? 'bg-blue-500 text-white' 
      : 'bg-gray-100 text-gray-900'
  }`;

  const timestampClass = `text-xs mt-1 ${
    isSender 
      ? 'text-white/70' 
      : 'text-gray-500'
  }`;

  return (
    <div className={messageContainerClass}>
      {!isSender && (
        <Avatar 
          name={message.sender} 
          size="40" 
          round={true} 
          className="flex-shrink-0"
        />
      )}
      <div className={messageContentClass}>
        {renderMessageContent()}
        <div className={timestampClass}>
          {message.timestamp ? formatTimestamp(message.timestamp) : 'Sending...'}
        </div>
      </div>
    </div>
  );
}

export default MessageWithAvatar;