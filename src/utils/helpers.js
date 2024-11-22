export const generateUniqueUsername = (baseName, existingNames) => {
  if (!existingNames.includes(baseName)) return baseName;
  let counter = 1;
  while (existingNames.includes(`${baseName}${counter}`)) {
    counter++;
  }
  return `${baseName}${counter}`;
};

export const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const validateMessage = (message) => {
  return message.trim().length > 0 && message.trim().length <= 1000;
};