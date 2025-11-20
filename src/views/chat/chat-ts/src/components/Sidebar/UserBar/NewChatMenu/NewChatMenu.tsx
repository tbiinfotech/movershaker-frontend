import React, { useState, useContext, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { serverTimestamp } from 'firebase/firestore';
import UserSearch from '../../../UserSearch/UserSearch';
import InputBox from '../../../InputBox/InputBox';
import { db, auth } from '../../../../firebase';
import { AppState } from '../../../../../../../../store/chatStore';
import AddIcon from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
import { AuthContext } from '../../../../../../../../contexts/AuthContext';
import { Dialog, IconButton, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';
import {
  collection,
  addDoc,
  doc,
  getDoc,
  setDoc,
  getDocs,
  QueryDocumentSnapshot,
  DocumentData,
  updateDoc
  // serverTimestamp
} from 'firebase/firestore';
import { convertDocToUser, getOtherPrivateChatsMembers } from '../../../../utils';
import { useAuthState } from 'react-firebase-hooks/auth';
import CreateGroupChatDialog from '../../../UserSearch/CreateGroupChatDialog';
import { setChats, setCurrentChat } from '../../../../actions';
import { useDispatch } from 'react-redux';
import { SET_CURRENT_CHAT } from '../../../../../../../../types/actions';
import { toast } from 'react-toastify';
import { Dispatch, SetStateAction } from 'react';
import Chat from '../../../../../../../../types/Chat';

interface Props {
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
}

const NewChatMenu = ({ search, setSearch }: Props) => {
  const { auth: loggedInUser } = useContext(AuthContext);
  const [user, loading] = useAuthState(auth);
  const chats = useSelector((state: AppState) => state.chats.chats);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isPrivateDialogOpen, setIsPrivateDialogOpen] = useState(false);
  const [isPublicDialogOpen, setIsPublicDialogOpen] = useState(false);
  const [allUsers, setUsers] = useState('');
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchedUsers = async () => {
      try {
        const usersRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersRef); // Use getDocs for collections
        const users = usersSnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
          ...doc.data(),
          id: doc.id
        }));

        setUsers(users);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchedUsers();
  }, []);

  const openMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const closeMenu = () => {
    setAnchorEl(null);
  };

  const openPrivateDialog = () => {
    closeMenu();
    setIsPrivateDialogOpen(true);
  };

  const closePrivateDialog = () => {
    setIsPrivateDialogOpen(false);
  };

  const openChatDialog = () => {
    closeMenu();
    setIsPublicDialogOpen(true);
  };

  const closeChatDialog = () => {
    setIsPublicDialogOpen(false);
  };

  const createChat = async (type: 'private' | 'group', chatData: any) => {
    try {
      console.log('chatData : chatData', chatData);

      await addDoc(collection(db, 'chats'), {
        ...chatData,
        createdAt: serverTimestamp(),
        recentMessage: {
          text: 'Chat created',
          sentAt: serverTimestamp(),
          sentBy: {
            uid: user.uid,
            displayName: user.displayName
          }
        }
      });
      if (type === 'private') {
        closePrivateDialog();
      } else {
        closeChatDialog();
      }
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  const createPrivateChat = async (id: string) => {
    // console.log('the private chat create function is called');
    try {
      const otherMemberRef = doc(db, 'users', id);
      const otherMemberDoc = await getDoc(otherMemberRef);

      if (!otherMemberDoc.exists()) {
        console.error('User not found');
        return;
      }

      const otherMember = convertDocToUser(otherMemberDoc);

      console.log('otherMember: %%%%%%%%', otherMember);

      const currentUser = {
        uid: loggedInUser.user._id,
        displayName: user.displayName,
        photoURL: user.photoURL,
        email: user.email
      };

      // Generate a unique room ID based on the members' UIDs
      const messageRoomId = `${loggedInUser.user._id}` > `${id}` ? `${loggedInUser.user._id}-${id}` : `${id}-${loggedInUser.user._id}`;

      console.log('messageRoomId:', messageRoomId);

      // Check if the chat already exists
      const chatRef = doc(db, 'chats', messageRoomId);
      const chatDoc = await getDoc(chatRef);

      if (chatDoc.exists()) {
        toast.info('Chat already exists with user.');
        await updateDoc(doc(db, 'chats', chatDoc.id), {
          updatedAt: serverTimestamp()
        });
        console.log('Chat already exists:', chatDoc.data(), chatDoc.id);
        dispatch(setCurrentChat({ ...chatDoc.data(), id: chatDoc.id }));

        dispatch(setChats([{ ...chatDoc.data(), id: chatDoc.id } as Chat, ...chats.filter((chat: any) => chat.id !== chatDoc.id)]));
        setIsPrivateDialogOpen(false);
        return; // Chat already exists, no need to create a new one
      }
      const newDateId = new Date(new Date()).toISOString().split('T')[0];
      // Create the new chat
      await setDoc(chatRef, {
        _id: newDateId,
        uid: messageRoomId,
        name: otherMember?.username,
        type: 'private',
        members: [id, loggedInUser.user._id],
        createdBy: loggedInUser.user._id,
        createdAt: serverTimestamp(),
        photoURL: otherMember?.photoURL || null,
        recentMessage: {
          text: 'Chat created',
          sentAt: serverTimestamp(),
          sentBy: currentUser
        }
      });

      const chatDocSnap = await getDoc(chatRef);

      if (chatDocSnap.exists()) {
        toast.success('Chat created with user');
        console.log('new chat created --------------------------- ', chatDocSnap.data());
        const createdChat = chatDocSnap.data();
        // setSearch(chatDocSnap.data().name);
        dispatch(setCurrentChat({ ...chatDocSnap.data(), id: chatDocSnap.id }));
        dispatch(
          setChats([{ ...chatDocSnap.data(), id: chatDocSnap.id } as Chat, ...chats.filter((chat: any) => chat.id !== chatDocSnap.id)])
        );
      } else {
        toast.error('No chat doc found in db (after creation)');
        throw new Error('No chat doc found after creation');
      }

      setIsPrivateDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message);
      setIsPrivateDialogOpen(false);

      console.error('Error creating private chat:', error);
    }
  };

  const createPublicChat = async (id: string) => {
    try {
      const otherMemberRef = doc(db, 'users', id);
      const otherMemberDoc = await getDoc(otherMemberRef);

      if (!otherMemberDoc.exists()) {
        console.error('User not found');
        return;
      }

      const otherMember = convertDocToUser(otherMemberDoc);

      let currentUser = {
        uid: loggedInUser.user._id,
        displayName: user.displayName,
        photoURL: user.photoURL,
        email: user.email
      };

      createChat('public', {
        name: '',
        type: 'group',
        members: [otherMember, currentUser],
        createdBy: user.uid
      });
    } catch (error) {
      console.error('Error creating public chat:', error);
    }
  };

  return (
    <>
      <IconButton onClick={openMenu}>
        <AddIcon />
      </IconButton>
      <Menu anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={closeMenu}>
        <MenuItem onClick={openPrivateDialog}>
          <ListItemIcon>
            <PersonIcon />
          </ListItemIcon>
          <ListItemText primary="Private" />
        </MenuItem>
        <MenuItem onClick={openChatDialog}>
          <ListItemIcon>
            <PeopleIcon />
          </ListItemIcon>
          <ListItemText primary="Public" />
        </MenuItem>
      </Menu>
      <Dialog open={isPrivateDialogOpen} onClose={closePrivateDialog}>
        <UserSearch
          onItemClick={createPrivateChat}
          onCancel={closePrivateDialog}
          avoidIdList={
            Array.isArray(chats) && chats.length > 0
              ? chats
                  .filter((chat) => chat.type === 'private')
                  .map((chat) => getOtherPrivateChatsMembers(chat, loggedInUser.user._id))
                  .flat()
              : []
          }
        />
      </Dialog>

      <CreateGroupChatDialog
        isOpen={isPublicDialogOpen}
        closeDialog={closeChatDialog}
        users={allUsers && allUsers.filter((users) => users.id !== user.uid)} // Exclude already in group
        createGroupChat={(programName, selectedUsers) => {
          createChat('group', {
            name: programName,
            type: 'group',
            members: selectedUsers,
            createdBy: user.uid
          });
          console.log('Group created with users:', selectedUsers);
        }}
      />
    </>
  );
};

export default NewChatMenu;
