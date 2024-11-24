import React from 'react';
import 'src/styles/components/ui/scroll-area.css';

const ScrollArea = ({ children, className, ...props }) => {
  return (
    <div className={`scroll-area ${className}`} {...props}>
      {children}
    </div>
  );
};

export default ScrollArea;
