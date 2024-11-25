import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const variants = {
  default: 'bg-white text-gray-900 shadow-lg',
  success: 'bg-green-50 text-green-900 shadow-lg',
  error: 'bg-red-50 text-red-900 shadow-lg',
  warning: 'bg-yellow-50 text-yellow-900 shadow-lg',
  info: 'bg-blue-50 text-blue-900 shadow-lg'
};

const positions = {
  top: 'top-0',
  bottom: 'bottom-0',
  topRight: 'top-0 right-0',
  topLeft: 'top-0 left-0',
  bottomRight: 'bottom-0 right-0',
  bottomLeft: 'bottom-0 left-0'
};

export function Notification({
  position = 'topRight',
  autoClose = 5000,
  hideProgressBar = false,
  closeOnClick = true,
  pauseOnHover = true,
  draggable = true,
  className = '',
  ...props
}) {
  return (
    <ToastContainer
      position={position}
      autoClose={autoClose}
      hideProgressBar={hideProgressBar}
      closeOnClick={closeOnClick}
      pauseOnHover={pauseOnHover}
      draggable={draggable}
      closeButton
      className={`${positions[position]} ${className}`}
      toastClassName={({ type = 'default' }) => 
        `relative flex p-4 min-h-10 rounded-md justify-between overflow-hidden cursor-pointer 
        ${variants[type] || variants.default}`
      }
      {...props}
    />
  );
}

export const notify = (message, type = 'default') => {
  toast(message, { 
    type,
    className: variants[type] || variants.default
  });
};

export default Notification;
