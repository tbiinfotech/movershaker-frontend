import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  TextField,
} from '@mui/material';

interface User {
  id: string;
  username: string;
}

interface CreateGroupChatDialogProps {
  isOpen: boolean;
  closeDialog: () => void;
  users: User[];
  createGroupChat: (groupName: string, selectedUserIds: string[]) => void;
}

const CreateGroupChatDialog: React.FC<CreateGroupChatDialogProps> = ({
  isOpen,
  closeDialog,
  users,
  createGroupChat,
}) => {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState<string>('');

  const handleToggle = (userId: string) => {
    setSelectedUsers((prevSelected) => {
      if (prevSelected.includes(userId)) {
        return prevSelected.filter((id) => id !== userId); // Deselect user
      } else {
        return [...prevSelected, userId]; // Select user
      }
    });
  };

  const handleCreateGroup = () => {
    if (selectedUsers.length === 0) {
      alert('Please select at least one user to create a group.');
      return;
    }
    if (!groupName.trim()) {
      alert('Please provide a group name.');
      return;
    }
    createGroupChat(groupName, selectedUsers); // Pass group name and selected users
    closeDialog();
    setSelectedUsers([]);
    setGroupName('');
  };

  if (!isOpen) return null; // Prevent rendering when not open

  return (
    <Dialog open={isOpen} onClose={closeDialog} fullWidth>
      <DialogTitle>Create Group Chat</DialogTitle>
      <DialogContent>
        {/* Group name input field */}
        <TextField
          label="Group Name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          fullWidth
          margin="normal"
        />
        <List>
          {users.map((user) => (
            <ListItem
              key={user.id}
              button
              onClick={() => handleToggle(user.id)}
            >
              <Checkbox
                checked={selectedUsers.includes(user.id)}
                inputProps={{ 'aria-label': `Select ${user.username}` }}
              />
              <ListItemText primary={user.username} />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeDialog} color="secondary">
          Cancel
        </Button>
        <Button
          onClick={handleCreateGroup}
          color="primary"
          variant="contained"
          disabled={selectedUsers.length === 0 || !groupName.trim()}
        >
          Create Group
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateGroupChatDialog;
