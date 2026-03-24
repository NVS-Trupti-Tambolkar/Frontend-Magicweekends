import React, { createContext, useContext, useState } from 'react';

// Create a Context to manage notification state
const NotificationContext = createContext();

// Provide Notification context value to children
export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState({ open: false, message: '', type: 'success' });

  const triggerNotification = (message, type = 'success') => {
    setNotification({ open: true, message, type });
  };

  const closeNotification = () => {
    setNotification({ open: false, message: '', type: '' });
  };

  return (
    <NotificationContext.Provider value={{ notification, triggerNotification, closeNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook to use notification context
export const useNotification = () => useContext(NotificationContext);
