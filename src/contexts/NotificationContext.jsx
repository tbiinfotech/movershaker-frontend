import React, { createContext, useState } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

const NotificationContext = createContext();

const NotificationProvider = ({ children }) => {
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState('');
  const [variant, setVariant] = useState('success');

  const showToast = (msg, variant = 'success') => {
    setMessage(msg);
    setVariant(variant);
    setShow(true);
  };

  const handleClose = () => setShow(false);

  return (
    <NotificationContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer position="middle-center" className="p-3">
        <Toast show={show} onClose={handleClose} bg={variant} delay={3000} autohide>
          <Toast.Body className={'text-white'}>{message}</Toast.Body>
        </Toast>
      </ToastContainer>
    </NotificationContext.Provider>
  );
};

// Custom Hook to use NotificationContext
const useNotification = () => React.useContext(NotificationContext);

export { NotificationProvider, useNotification };
