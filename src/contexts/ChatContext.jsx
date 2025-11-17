import React, { createContext, useState, useContext, useEffect } from 'react';
import { ChatService } from '../services/chat';

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (currentChat?.id && currentChat?.groupName) {
      const unsubscribe = ChatService.subscribeToMessages(currentChat.id, setMessages, 'chat_groups');
      return () => unsubscribe();
    }

    if (currentChat?.id && !currentChat?.groupName) {
      const unsubscribe = ChatService.subscribeToMessages(currentChat.id, setMessages, 'chats');
      return () => unsubscribe();
    }
  }, [currentChat]);

  const value = {
    currentChat,
    setCurrentChat,
    messages,
    sendMessage: (messageData) => ChatService.sendMessage(currentChat.id, messageData),
    sendGroupMessage: (messageData) => ChatService.sendGroupMessage(currentChat.id, messageData)
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export const useChat = () => useContext(ChatContext);
