// button.jsx
import React from 'react';
import '/src/styles/components/ui/button.css';

const variants = {
  default: 'bg-primary text-primary-foreground hover:bg-primary/90',
  ghost: 'hover:bg-accent hover:text-accent-foreground',
  // Add other variants as needed
};

const sizes = {
  icon: 'h-10 w-10',
  md: 'h-10 px-4 py-2',
  // Add other sizes as needed
};

export function Button({ 
  children, 
  variant = 'default', 
  size = 'md', 
  className = '', 
  ...props 
}) {
  return (
    <button 
      className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

// Also export a default for those who prefer default imports
export default Button;