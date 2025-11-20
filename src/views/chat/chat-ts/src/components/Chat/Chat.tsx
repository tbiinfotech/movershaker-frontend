import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import ChatBar from './ChatBar';
import Messages from './Messages';
import SendBox from './SendBox';
import { AppState } from '../../../../../../store/chatStore';
import Logo from '../../../../../../assets/images/moverLogo.jpg';
import './Chat.css';
import { collection, addDoc, doc, setDoc, onSnapshot, getDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

const Chat = (props: any) => {
  const { contactClick } = props;
  const [currentChatId, setCurrentChatId] = useState<string>('');
  const chats = useSelector((state: AppState) => state.chats.chats);
  const currentChat = useSelector((state: AppState) => state.chats.currentChat);
  const [existMessage, setMessageExist] = useState<Boolean>(false);
  const [isScroll, setIsScroll] = useState<Boolean>(false);

  useEffect(() => {
    if (currentChat?.id) {
      setCurrentChatId(currentChat.id);
    }
  }, [currentChat]);

  // useEffect(() => {
  //   updateSupportChat();
  // }, []);

  // const updateSupportChat = async () => {
  //   try {
  //     const chatsRef = collection(db, 'chats');
  //     let baseQuery = query(chatsRef, where('type', '==', 'massupportchat'));
  //     const snapshot = await getDocs(baseQuery)
  //     const chats = snapshot.docs.filter((doc) => doc.data());
  //     console.log(`Found ${snapshot.size} chats`, chats);

  //     for (const chatDoc of snapshot.docs) {
  //       const existName = chatDoc.name;
  //       await setDoc(
  //         doc(db, 'chats', chatDoc.id),
  //         {
  //           name: 'MaS Student Support',
  //           name1: existName
  //         },
  //         { merge: true },
  //       )
  //     }
  //   } catch (error) {
  //     console.error('Error updating support chat:', error);
  //   }
  // }

  if (!Array.isArray(chats) || !chats.some((chat) => chat.id === currentChatId)) {
    return (
      <div className="no-chat-container">
        <h4>Welcome to Movers & Shakers</h4>
        <p>Select a chat to start messaging</p>
        <img src={Logo} alt="No chat selected" className="no-chat-image" />
      </div>
    );
  }

  return (
    <div className="chat-container">
      <ChatBar handleClick={contactClick} existMessage={existMessage} />
      <Messages IsMessageExist={setMessageExist} isScroll={isScroll} />
      <SendBox setIsScroll={setIsScroll} />
    </div>
  );
};

export default Chat;
