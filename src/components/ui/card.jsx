import React from 'react';
import 'src/styles/components/ui/card.css';

const Card = ({ children, className, ...props }) => {
  return (
    <div className={`card ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;
