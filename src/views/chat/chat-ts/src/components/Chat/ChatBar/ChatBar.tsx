import { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import User from '../../../../../../../types/User';
import Chat from '../../../../../../../types/Chat';
import PrivateMenu from './PrivateMenu';
import PublicMenu from './PublicMenu';
import { AppState } from '../../../../../../../store/chatStore';
import { cutText, formatDate, getOtherPrivateChatMember } from '../../../utils';
import { Avatar, Box, Typography } from '@mui/material';
// import useStyles from './styles';
import { BoldText } from './styles';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../../firebase';
import { AuthContext } from '../../../../../../../contexts/AuthContext';

const ChatBar = (props: any) => {
  const { auth: loggedInUser } = useContext(AuthContext);
  const { handleClick, existMessage } = props;
  // const classes = useStyles();
  const [user, loading] = useAuthState(auth);
  const [chatID, setCurrentChatId] = useState<string>();
  const chats = useSelector((state: AppState) => state.chats.chats);
  const currentChat = useSelector((state: AppState) => state.chats.currentChat);
  const [chat, setChat] = useState<Chat>();
  const [otherMember, setOtherMember] = useState<User>();
  const [userStatus, setStatus] = useState<string>();

  useEffect(() => {
    if (currentChat?.id) {
      setCurrentChatId(currentChat?.id);
    }
  }, [currentChat]);

  useEffect(() => {
    const fetchOtherMember = async () => {
      const selectedChat = chats.find((chat) => chat.id === chatID);
      setChat(selectedChat);

      if (selectedChat) {
        if (selectedChat.type === 'private') {
          const otherMemberData = await getOtherPrivateChatMember(selectedChat, loggedInUser.user._id);
          console.log(otherMemberData, 'otherMember');

          if (otherMemberData?.status === 'online') {
            setStatus('online');
          } else {
            if (otherMemberData?.lastSeen) {
              setStatus(`Last seen ${new Date(otherMemberData.lastSeen * 1000).toLocaleTimeString()}`);
            } else {
              setStatus('offline');
            }
          }
          setOtherMember(otherMemberData);
        } else {
          setOtherMember(undefined);
        }
      }
    };

    fetchOtherMember();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chats, chatID, user.uid]);

  // console.log("chat ######################", chat)

  return (
    <Box px={2} py={1} border={1} borderTop={0} borderRight={0} borderLeft={0} borderColor={'divider'}>
      {chat ? (
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center">
            <Avatar
              src={chat.type === 'private' ? otherMember?.photoURL : chat?.photoURL}
              onClick={() => handleClick(chatID)}
              style={{ cursor: 'pointer' }}
            />
            <Box
              display="flex"
              flexDirection="column"
              justifyContent="center"
              ml={1}
              onClick={() => handleClick(chatID)}
              style={{ cursor: 'pointer' }}
            >
              <BoldText>
                {chat.type === 'private'
                  ? otherMember?.username
                    ? cutText(otherMember.username, 24)
                    : ''
                  : chat.name && cutText(chat.name, 24)}
              </BoldText>
              <Typography variant="caption" color="textSecondary">
                {existMessage
                  ? chat.type === 'private'
                    ? userStatus
                    : `${chat ? 'Last message at ' + formatDate(chat.recentMessage?.sentAt) : 'Created at'}`
                  : ''}
              </Typography>
            </Box>
          </Box>
          {chat.type === 'private' ? (
            <PrivateMenu />
          ) : (
            <PublicMenu chat={chat} isOwner={chat.createdBy === loggedInUser.user._id} infoPage={false} members={[]} />
          )}
        </Box>
      ) : (
        ''
      )}
    </Box>
  );
};

export default ChatBar;
