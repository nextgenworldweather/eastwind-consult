import React from 'react';
import 'src/styles/components/ui/input.css';

const Input = ({ className, ...props }) => {
  return (
    <input
      className={`input ${className}`}
      {...props}
    />
  );
};

export default Input;
