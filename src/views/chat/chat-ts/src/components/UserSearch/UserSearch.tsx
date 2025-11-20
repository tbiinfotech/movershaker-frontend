import { useEffect, useState, useContext } from 'react';
import { useSelector } from 'react-redux';
import User from '../../../../../../types/User';
import { db, auth } from '../../firebase';
import { AppState } from '../../../../../../store/chatStore';
import { convertDocToUser } from '../../utils';
import { Avatar, Box, Button, Input, List, ListItem } from '@mui/material';
import { cutText } from '../../utils';
// import useStyles from './styles';
import { query, collection, orderBy, getDocs } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { AuthContext } from '../../../../../../contexts/AuthContext';
import { StyledList, StyledAvatar, StyledInput, StyledListItem } from './styles';

interface Props {
  onItemClick: (id: string) => void;
  onCancel: () => void;
  avoidIdList?: any; // Optional array of IDs to avoid
}

const UserSearch = ({ onItemClick, onCancel, avoidIdList }: Props) => {
  console.log('Filter results', avoidIdList);
  // const classes = useStyles();
  const { auth: loggedInUser } = useContext(AuthContext);
  const [user, loading] = useAuthState(auth); // Current authenticated user
  const [input, setInput] = useState(''); // Search input
  const [users, setUsers] = useState<User[]>([]); // List of users
  const chats = useSelector((state: AppState) => state.chats.chats);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const usersQuery = query(collection(db, 'users'), orderBy('username'));

      const snapshot = await getDocs(usersQuery);
      const users = snapshot.docs
        .filter((doc) => doc.id !== loggedInUser.user._id) // Exclude the logged-in user
        .map((doc) => convertDocToUser(doc)); // Convert remaining docs to user objects

      setUsers(users);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Handle input changes for search
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.currentTarget.value);
  };

  const filterResults = (word: string, users: User[]) => {
    const regex = new RegExp(word, 'gi');
    return users.filter(
      (otherUser) => otherUser.username.match(regex) && otherUser.uid !== user?.uid && !avoidIdList?.includes(otherUser.uid)
    );
  };

  // Filter users based on search input and avoid list
  const eligibleUsers = filterResults(input, users).filter((user) => {
    // Exclude users already in any private chat
    const isMember = chats.filter((chat) => chat.type === 'private').some((chat) => chat.members.some((member) => member.uid === user.uid));
    return !isMember;
  });

  // Then, map to your ListItem components
  const usersList = eligibleUsers.map((user) => (
    <StyledListItem
      key={user.uid}
      id={user.uid}
      // className={classes.li}
      button
      onClick={(e: React.MouseEvent<HTMLDivElement>) => onItemClick(e.currentTarget.id)}
    >
      {/* <Avatar className={classes.avatar} src={user.photoURL} /> */}
      <StyledAvatar src={user.photoURL} />
      {cutText(user.username, 30)} {/* Display truncated name if too long */}
    </StyledListItem>
  ));

  console.log('usersList :::::::::::::::::', usersList);

  return (
    <Box p={2} width="300px">
      {/* Search input field */}
      <StyledInput
        // className={classes.input}
        placeholder="Search"
        onChange={handleInput}
        value={input}
        // disableUnderline
        required
        autoFocus
        fullWidth
      />
      {/* List of users based on filtered results */}
      {/* {usersList.length > 0 ? <List className={classes.list}>{usersList}</List> : <List className={classes.list}>User Not found</List>} */}
      {usersList.length > 0 ? <StyledList>{usersList}</StyledList> : <StyledList>User Not found</StyledList>}

      {/* Cancel button */}
      <Button color="secondary" variant="contained" onClick={onCancel} fullWidth>
        Cancel
      </Button>
    </Box>
  );
};

export default UserSearch;
