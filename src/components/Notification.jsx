import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Notification = () => {
  return <ToastContainer />;
};

export const notify = (message, type = 'default') => {
  toast(message, { type });
};

export default Notification;
