import React from 'react';
import '../styles/components/Notification.css';

export const notify = (message, type = 'info') => {
  console.log(`[${type.toUpperCase()}]: ${message}`);
};

const Notification = () => {
  return <div className="notification-container"></div>;
};

export default Notification;
