import UserBar from './UserBar';
import ChatSearch from './ChatSearch';
import Chats from './Chats';
import { Box } from '@mui/material';
import { useState } from 'react';
// import useStyles from './styles';
import { SidebarWrapper } from './styles';
import { useSelector } from 'react-redux';
import { AppState } from '../../../../../../store/chatStore';

const Sidebar = () => {
  // const classes = useStyles();
  const [search, setSearch] = useState('');
  const chats = useSelector((state: AppState) => state.chats.chats);

  return (
    <SidebarWrapper
      // className={classes.sidebar}
      display="flex"
      flexDirection="column"
      border={1}
      borderTop={0}
      borderBottom={0}
      borderLeft={0}
      borderColor={'divider'}
    >
      <UserBar search={search} setSearch={setSearch} />
      <ChatSearch search={search} setSearch={setSearch} />
      <Chats search={search} />
    </SidebarWrapper>
  );
};

export default Sidebar;
