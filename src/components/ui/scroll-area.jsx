import React from 'react';
import '/src/styles/components/ui/scroll-area.css';

export function ScrollArea({ className = '', children, ...props }) {
  return (
    <div
      className={`relative overflow-auto ${className}`}
      {...props}
    >
      <div className="h-full w-full rounded-[inherit]">
        {children}
      </div>
    </div>
  );
}

export function ScrollBar({ className = '', orientation = "vertical", ...props }) {
  return (
    <div
      className={`flex touch-none select-none transition-colors ${
        orientation === "horizontal" 
          ? "h-2.5 flex-col border-t border-t-transparent p-[1px]" 
          : "w-2.5 border-l border-l-transparent p-[1px]"
      } ${className}`}
      {...props}
    />
  );
}

export default ScrollArea;