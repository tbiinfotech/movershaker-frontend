import Chat from '../types/Chat';
import Message from '../types/Message';
import User from '../types/User';
import dayjs from 'dayjs';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import CryptoJS from 'crypto-js';
import { db } from '../firebase';

const SECRET_KEY_FOR_MESSAGE_ENCRYPTION = '762UDJ1189782090KSCJKKsgghsj7w828yisuhs';

export const convertDocToUser = (doc: any): User => {
  const user: User = {
    uid: doc.data().uid,
    username: doc.data().username,
    email: doc.data().email,
    photoURL: doc.data().photoURL || null
  };
  return user;
};

export const convertDocToChat = (doc: any): Chat => {
  if (!doc.data().name) {
    // console.log("doc.data().name not found *********", doc.data())
  }
  const chat: Chat = {
    id: doc.id,
    name: doc.data().name,
    createdAt: doc.data().createdAt,
    createdBy: doc.data().createdBy,
    type: doc.data().type,
    members: doc.data().members,
    recentMessage: doc.data().recentMessage,
    photoURL: doc.data().photoURL,
    isChatRoomAllowed: doc.data().isChatRoomAllowed || false
  };
  return chat;
};

export const convertDocToMessage = (doc: any): Message => {
  let data = doc.data();
  const message: Message = {
    id: doc.id,
    text: data.text,
    sentBy: data.sentBy,
    image: data.image || null,
    video: data.video || null,
    fileUrl: data.fileUrl || null,
    sentAt: data.sentAt,
    isRead: data.isRead || [],
    replies: data.replies || null,
    isDeleted: data.isDeleted || false,
    reactions: data.reactions || []
  };
  return message;
};

export const getOtherPrivateChatMember = async (chat: Chat, excludedID: string) => {
  // console.log("chat in getOtherPrivateChatMember *********", chat)

  const otherMembers = await Promise.all(
    chat.members?.map(async (member: any) => {
      if (typeof member === 'string') {
        if (member && member !== excludedID) {
          const memberDocRef = doc(db, 'users', member);
          const memberSnapshot = await getDoc(memberDocRef);
          return memberSnapshot.exists() ? memberSnapshot.data() : null;
        }
      } else if (typeof member == 'object') {
        if (member.id && member.id !== excludedID) {
          const memberDocRef = doc(db, 'users', member.id);
          const memberSnapshot = await getDoc(memberDocRef);
          return memberSnapshot.exists() ? memberSnapshot.data() : null;
        }
      }
      return null;
    })
  );
  return otherMembers.filter((member) => member !== null)[0];
};

export const getOtherPrivateChatsMembers = (chats: Chat[] | undefined, excludedID: string) => {
  if (!Array.isArray(chats)) {
    return [];
  }

  return chats
    .map((chat) => {
      const member = getOtherPrivateChatMember(chat, excludedID);
      return member ? member.uid : null;
    })
    .filter((uid) => uid !== null);
};

export const cutText = (text: string, length: number) => {
  return text.length <= length ? text : text.substr(0, length) + '...';
};

export const formatDate = (time: any) => {
  if (!time) return dayjs(new Date()).format('DD/MM HH:mm');

  if (time instanceof Date) return dayjs(time).format('DD/MM HH:mm');

  if (typeof time.toDate === 'function') return dayjs(time.toDate()).format('DD/MM HH:mm');

  if (typeof time === 'string' || typeof time === 'number') {
    const parsedDate = new Date(time);
    if (!isNaN(parsedDate)) return dayjs(parsedDate).format('DD/MM HH:mm');
  }

  return dayjs(new Date()).format('DD/MM HH:mm');
};

export const encryptMessage = (message: string) => {
  if (!message || message?.trim() === '') return '';
  // check is message is encrypted or not
  if (message.includes('U2FsdGVkX1')) {
    return message;
  }

  const encryptedMessage = CryptoJS.AES.encrypt(message, SECRET_KEY_FOR_MESSAGE_ENCRYPTION).toString();
  return encryptedMessage;
};

// Decrypt the message when receiving
export const decryptMessage = (encryptedMessage: string) => {
  if (!encryptedMessage || encryptedMessage?.trim() === '') return '';
  // check is message is decrypted or not
  if (!encryptedMessage.includes('U2FsdGVkX1')) {
    return encryptedMessage;
  }
  const bytes = CryptoJS.AES.decrypt(encryptedMessage, SECRET_KEY_FOR_MESSAGE_ENCRYPTION);
  const decryptedMessage = bytes.toString(CryptoJS.enc.Utf8);
  return decryptedMessage;
};
