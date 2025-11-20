import { useSelector } from 'react-redux';
import NewChatMenu from './NewChatMenu';
import OptionsMenu from './OptionsMenu';
import { AppState } from '../../../../../../../store/chatStore';
import { Avatar, Box, Typography } from '@mui/material';
// import useStyles from './styles';
import ThemeSwitcher from './ThemeSwitcher';
import { UserInfo, UserActions, Title } from './styles';
import { Dispatch, SetStateAction } from 'react';

interface Props {
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
}

const UserBar = ({ search, setSearch }: Props) => {
  // const classes = useStyles();
  const user = useSelector((state: AppState) => state.user);

  return (
    <Box display="flex" justifyContent="space-between" m={2} mb={1}>
      <UserInfo display="flex" alignItems="center">
        <Avatar src={`${user.photoURL}`} />
        <Title variant="h5">Chats</Title>
      </UserInfo>
      <UserActions display="flex">{/* <NewChatMenu search={search} setSearch={setSearch} /> */}</UserActions>
    </Box>
  );
};

export default UserBar;
