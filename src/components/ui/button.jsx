import React from 'react';
import '/src/styles/components/ui/button.css';

const Button = ({ children, variant = 'default', size = 'md', className, ...props }) => {
  return (
    <button
      className={`button ${variant} ${size} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
