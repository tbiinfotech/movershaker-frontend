import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { db } from '../../../../firebase';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import BlockIcon from '@mui/icons-material/Block';
import DeleteIcon from '@mui/icons-material/Delete';
import { AppState } from '../../../../../../../../store/chatStore';
import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { doc, deleteDoc } from 'firebase/firestore';

const PrivateMenu = () => {
  const [chatId, setCurrentChatId] = useState<string>();
  const currentChat = useSelector((state: AppState) => state.chats.currentChat);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    if (currentChat?.id) {
      setCurrentChatId(currentChat?.id);
    }
  }, [currentChat]);

  const openMenu = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const deleteChat = async () => {
    try {
      const chatRef = doc(db, 'chats', currentChat.id);

      await deleteDoc(chatRef);
      closeMenu();
      console.log('Chat deleted successfully!');
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  const closeMenu = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton onClick={openMenu}>
        <MoreHorizIcon />
      </IconButton>
      <Menu anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={closeMenu}>
        <MenuItem disabled onClick={closeMenu}>
          <ListItemIcon>
            <BlockIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Block" />
        </MenuItem>
        {/* <MenuItem onClick={deleteChat}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Delete" />
        </MenuItem> */}
      </Menu>
    </>
  );
};

export default PrivateMenu;
