import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import UserSearch from '../../../UserSearch/UserSearch';
import Chat from '../../../../../../../../types/Chat';
import InputBox from '../../../InputBox/InputBox';
import { AppState } from '../../../../../../../../store/chatStore';
import { db } from '../../../../firebase';
import { doc, setDoc, getDoc, deleteDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton, Menu, MenuItem, Typography, ListItemIcon, ListItemText, Dialog, Switch } from '@mui/material';
import { convertDocToUser } from '../../../../utils';
import { toast } from 'react-toastify';
import { setCurrentChat } from '../../../../actions';

interface Props {
  chat: Chat;
  isOwner: boolean;
  infoPage: boolean;
  members: any;
}

const PublicMenu = ({ chat, members, isOwner, infoPage }: Props) => {
  const user = useSelector((state: AppState) => state.user);
  const [chatID, setCurrentChatId] = useState<string>();
  const currentChat = useSelector((state: AppState) => state.chats.currentChat);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isAddPersonDialogOpen, setIsAddPersonDialogOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [checkedHide, setCheckedHide] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (currentChat?.id) {
      setCurrentChatId(currentChat.id);
    }
    if (currentChat?.isChatRoomAllowed) {
      setCheckedHide(false);
    } else {
      setCheckedHide(true);
    }
  }, [currentChat]);

  const openMenu = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const closeMenu = () => {
    setAnchorEl(null);
  };

  const openAddPersonDialog = () => {
    setIsAddPersonDialogOpen(true);
    closeMenu();
  };

  const closeAddPersonDialog = () => {
    setIsAddPersonDialogOpen(false);
  };

  const openRenameDialog = () => {
    setIsRenameDialogOpen(true);
    closeMenu();
  };

  const closeRenameDialog = () => {
    setIsRenameDialogOpen(false);
  };

  const addPerson = async (id: string) => {
    if (chat.members.find((member) => member.uid === id)) {
      toast.info('user Already exists in chat');
      closeAddPersonDialog();
      return;
    }

    try {
      const newMemberDoc = await getDoc(doc(db, 'users', id));

      if (newMemberDoc.exists()) {
        const newMember = convertDocToUser(newMemberDoc);
        await updateDoc(doc(db, 'chats', chatID!), {
          members: arrayUnion(newMember.uid) // Adds new member to the chat
        });
        dispatch(setCurrentChat({ ...currentChat, members: [...currentChat.members, newMember.uid] }));
        closeAddPersonDialog();
        toast.success('User Added ');
      } else {
        // closeAddPersonDialog();
        toast.error('No user exits');
      }
    } catch (error) {
      console.error('Error adding person:', error);
      toast.error('Error addin person');
    }
  };

  const deleteChat = async () => {
    if (!isOwner) return;

    try {
      await deleteDoc(doc(db, 'chats', chatID!));
      console.log('Chat deleted successfully!');
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  const leaveChat = async () => {
    try {
      await updateDoc(doc(db, 'chats', chatID!), {
        members: arrayRemove(user) // Removes the current user from the chat
      });
      console.log('Left chat successfully!');
    } catch (error) {
      console.error('Error leaving chat:', error);
    }
  };

  const renameChat = async (newName: string) => {
    try {
      await updateDoc(doc(db, 'chats', chatID!), {
        name: newName
      });
      closeRenameDialog();
      console.log('Chat renamed successfully!');
    } catch (error) {
      console.error('Error renaming chat:', error);
    }
  };

  const handleChangeHideSwitch = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const chatRef = doc(db, 'chats', chatID!);
      const chatSnap = await getDoc(chatRef);

      const isChatRoomAllowed = !checkedHide;
      setCheckedHide(isChatRoomAllowed);
      if (chatSnap.exists()) {
        if (chatSnap.data().hasOwnProperty('isHidden')) {
          await updateDoc(chatRef, { isChatRoomAllowed: !isChatRoomAllowed });
        } else {
          await setDoc(chatRef, { isChatRoomAllowed: !isChatRoomAllowed }, { merge: true });
        }
      } else {
        await setDoc(chatRef, { isChatRoomAllowed: !isChatRoomAllowed });
      }
    } catch (error) {
      console.error('Error updating chat visibility:', error);
    }
  };

  return (
    <>
      {infoPage ? (
        <>
          <Typography variant="body1" style={{ cursor: 'pointer' }} onClick={() => openAddPersonDialog()}>
            Add Member
          </Typography>
          <Dialog open={isAddPersonDialogOpen} onClose={closeAddPersonDialog}>
            <UserSearch
              onItemClick={addPerson}
              onCancel={closeAddPersonDialog}
              avoidIdList={members && members.map((member: any) => member.uid)}
            />
          </Dialog>
          <Dialog open={isRenameDialogOpen} onClose={closeRenameDialog}>
            <InputBox onSubmit={renameChat} onCancel={closeRenameDialog} confirmBtnName={'Rename'} placeholder="New name" />
          </Dialog>
        </>
      ) : (
        <>
          <IconButton onClick={openMenu}>
            <MoreHorizIcon />
          </IconButton>
          <Menu anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={closeMenu}>
            <MenuItem onClick={openAddPersonDialog}>
              <ListItemIcon>
                <AddIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Add person" />
            </MenuItem>
            {isOwner ? (
              <MenuItem onClick={openRenameDialog}>
                <ListItemIcon>
                  <EditIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Rename" />
              </MenuItem>
            ) : (
              ''
            )}
            {isOwner ? null : ( // </MenuItem> //   <ListItemText primary="Delete" /> //   </ListItemIcon> //     <DeleteIcon fontSize="small" /> //   <ListItemIcon> // <MenuItem onClick={deleteChat}>
              <MenuItem onClick={leaveChat}>
                <ListItemIcon>
                  <ExitToAppIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText />
              </MenuItem>
            )}
            <MenuItem onClick={(e) => e.stopPropagation()}>
              <ListItemText primary="Hide Chat" />
              <Switch
                checked={checkedHide}
                onChange={handleChangeHideSwitch}
                inputProps={{ 'aria-label': 'controlled' }}
                size="small"
                // Prevents MenuItem from handling the click
              />
            </MenuItem>
            <Dialog open={isAddPersonDialogOpen} onClose={closeAddPersonDialog}>
              <UserSearch
                onItemClick={addPerson}
                onCancel={closeAddPersonDialog}
                avoidIdList={members && members.map((member: any) => member.uid)}
              />
            </Dialog>
            <Dialog open={isRenameDialogOpen} onClose={closeRenameDialog}>
              <InputBox onSubmit={renameChat} onCancel={closeRenameDialog} confirmBtnName={'Rename'} placeholder="New name" />
            </Dialog>
          </Menu>
        </>
      )}
    </>
  );
};

export default PublicMenu;
