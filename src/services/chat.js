// services/chat.js
import { db } from './firebase'; // Adjust the import based on your file structure
import { collection, onSnapshot, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';

export const ChatService = {
  subscribeToMessages: (chatId, setMessages, modal) => {
    const messagesRef = collection(db, modal, chatId, 'messages');
    const unsubscribe = onSnapshot(messagesRef, (snapshot) => {
      const messagesData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(messagesData);
    });
    return unsubscribe;
  },

  sendMessage: async (chatId, messageData) => {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    await addDoc(messagesRef, {
      ...messageData,
      timestamp: serverTimestamp()
    });

    const chatRef = doc(db, 'chats', chatId);
    await updateDoc(chatRef, {
      lastMessage: messageData.message, // Save the message content as the last message
      lastMessageTimestamp: new Date() // Save the timestamp of the last message
    });
  },

  sendGroupMessage: async (groupId, messageData) => {
    const messagesRef = collection(db, 'chat_groups', groupId, 'messages');
    await addDoc(messagesRef, {
      ...messageData,
      timestamp: serverTimestamp()
    });

    const groupRef = doc(db, 'chat_groups', groupId);
    await updateDoc(groupRef, {
      lastMessage: messageData.message, // Save the message content as the last message
      lastMessageTimestamp: serverTimestamp() // Save the timestamp of the last message
    });
  }
};
