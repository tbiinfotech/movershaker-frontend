import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyCIIbuDYbDLEc0LLDfoyLHny5Pz1pRHAA4',
  authDomain: 'mas-app-version-2.firebaseapp.com',
  projectId: 'mas-app-version-2',
  storageBucket: 'mas-app-version-2.firebasestorage.app',
  messagingSenderId: '346291266048',
  appId: '1:346291266048:web:5833ace6ff89255566aee5',
  measurementId: 'G-SP3PYG7013'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const chatAuth = getAuth(app);
const database = getDatabase(app);
const firestore = getFirestore(app);

const updateUserStatus = async (userId, isOnline) => {
  try {
    const userRef = doc(db, 'users', userId);

    const docSnapshot = await getDoc(userRef);

    if (docSnapshot.exists()) {
      await updateDoc(userRef, {
        lastSeen: isOnline ? null : new Date(),
        status: isOnline ? 'Online' : 'Offline'
      });
    } else {
      console.log(`No user found with ID: ${userId}`);
    }
  } catch (error) {
    console.error('Error updating user status:', error);
  }
};

const updateTypingStatus = async (userId, isTyping) => {
  console.log('Updating typing status', userId, isTyping);
  
  try {
    const userRef = doc(db, 'users', userId);
    
    await setDoc(userRef, { isTyping: isTyping }, { merge: true });

    console.log("Typing status updated successfully");
  } catch (error) {
    console.error("Error updating typing status:", error);
  }
};

const markMessageAsRead = async (messageId) => {
  const messageRef = doc(db, 'chats', chatID, 'messages', messageId);
  await updateDoc(messageRef, {
    isRead: []
  });
};

const deleteMessage = async (messageId) => {
  const messageRef = doc(db, 'chats', chatID, 'messages', messageId);
  await updateDoc(messageRef, {
    isDeleted: true,
    text: 'U2FsdGVkX1/J53pksDWJJNqbr3I5AmSI8/3/8PXf6uA7eYTBD2IzcqMv13wzz0CU'
  });
};

export { db, chatAuth, database, firestore, updateUserStatus, updateTypingStatus, markMessageAsRead, deleteMessage };
