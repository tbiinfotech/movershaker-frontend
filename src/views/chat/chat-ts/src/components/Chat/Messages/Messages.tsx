import React, { useEffect, useRef, useState, useContext, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import Picker from 'emoji-picker-react';
import Message from '../../../../../../../types/Message';
import _ from 'lodash';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  doc,
  setDoc,
  getDoc,
  arrayUnion,
  serverTimestamp,
  getDocs,
  limit,
  startAfter,
  writeBatch
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { db, auth } from '../../../firebase';
import { AppState } from '../../../../../../../store/chatStore';
import { convertDocToMessage, decryptMessage, encryptMessage } from '../../../utils';
import { Box, Typography, MenuItem, TextField, Button, Popover } from '@mui/material';
// import useStyles from './styles';
import {
  MessageC,
  OtherMessage,
  OwnMessage,
  ScrollBox,
  SendButton,
  SenderName,
  ReplyButton,
  ReplyContainer,
  ReplyHeader,
  ReplyInput,
  ReplyMessage,
  ReplyMessageText,
  ReplyPanel,
  ReplySender,
  ReplyText,
  MediaImage,
  MediaVideo,
  MenuBox,
  MenuItemC,
  ReadStatus,
  ReadTicks,
  UnreadTick,
  UnsupportedFile,
  MessageText,
  DeletedMessage,
  CancelButton,
  Timestamp
} from './styles';
import { useAuthState } from 'react-firebase-hooks/auth';
import { AuthContext } from '../../../../../../../contexts/AuthContext';

const PAGE_SIZE = 30;

const Messages = (props: any) => {
  const { isScroll, scrollRefTop } = props;
  // const classes = useStyles();
  const { auth: loggedInUser } = useContext(AuthContext);
  const [user] = useAuthState(auth);
  const [currentChatId, setCurrentChatId] = useState<string>();
  const currentChat = useSelector((state: AppState) => state.chats.currentChat);
  // const scrollRefTop = useRef<HTMLDivElement>(null);
  const scrollRefBottom = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [editedText, setEditedText] = useState('');
  const [currentSentById, setCurrentSentById] = useState('');
  const [currentMessageId, setCurrentMessageId] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<Message | null>(null);
  const [replyText, setReplyText] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [anchorElMenu, setAnchorElMenu] = useState<null | HTMLElement>(null);
  const [currentMessageEvent, setCurrentMessageEvent] = useState<null | HTMLElement>(null);
  const [IsMessageEditing, setIsEditing] = useState(false);
  const [initialMessageLoad, setInitialMessageLoad] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  // Memoize scrollToBottom to prevent re-creation
  const scrollToBottom = useCallback(() => {
    scrollRefBottom.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const scrollToTop = useCallback(() => {
    if (scrollRefTop.current) {
      scrollRefTop.current.scrollTop = 0;
    }
  }, [scrollRefTop]);

  // Sync currentChatId with Redux state
  useEffect(() => {
    if (currentChat?.id) {
      // setMessages([]);
      setCurrentChatId(() => currentChat.id);
      setInitialMessageLoad(true);
      scrollToTop();
    }
  }, [currentChat]);

  // const expensiveClac = useCallback(
  //   (newMessages: any) => {
  //     newMessages.reverse().filter((nM: any) => messages.find((m) => m.id != nM.id));
  //   },
  //   [messages]
  // );

  // const memorizeCalc = useMemo(() => expensiveClac(newMessages) , [messages]);

  // **Real-time listener for new messages**
  useEffect(() => {
    // console.log('current chat id is updated updated updated currentChatId', currentChatId);

    if (!currentChatId) return;

    const messagesRef = collection(db, 'chats', currentChatId, 'messages');
    const q = query(messagesRef, orderBy('sentAt', 'desc'), limit(PAGE_SIZE));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        // setInitialMessageLoad(true)
        const newMessages = snapshot.docs.map((doc) => convertDocToMessage(doc));

        // setMessages(newMessages.reverse()); // Reverse to maintain correct order

        setMessages(newMessages); // Reverse to maintain correct order
        setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
        setHasMore(snapshot.docs.length === PAGE_SIZE);
        setInitialMessageLoad(false);

        // const filteredNewMessage = newMessages.reverse().filter((nM: any) => messages.find((m) => m.id != nM.id));
        // console.log(filteredNewMessage, 'new filter message filter message');

        // const memorizeCalc = useMemo(() => expensiveClac(newMessages), [messages]);

        // console.log(memorizeCalc, 'the mormized updated filter message');

        // if (initialMessageLoad) {
        // setMessages(newMessages.reverse()); // Reverse to maintain correct order
        // } else {
        // setMessages((prev) => [ ...prev , ...filteredNewMessage]);
        // }

        // Scroll to bottom on initial load
        // setTimeout(() => {
        //   scrollRefBottom.current?.scrollIntoView({ behavior: 'smooth' });
        // }, 500);
      }
    });

    return () => unsubscribe();
  }, [currentChatId]);

  // Load more messages (pagination)
  const loadMoreMessages = useCallback(async () => {
    // console.log(hasMore, isLoading, lastVisible, currentChatId, 'sjdflaksdjflk');
    if (!hasMore || isLoading || !lastVisible || !currentChatId) return;

    // const chatContainer = scrollRefTop.current; // Reference to the chat container
    // if (!chatContainer) return;

    // const previousScrollHeight = chatContainer.scrollHeight;

    setIsLoading(true);
    try {
      const messagesRef = collection(db, 'chats', currentChatId, 'messages');
      const q = query(messagesRef, orderBy('sentAt', 'desc'), startAfter(lastVisible), limit(PAGE_SIZE));

      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        // const newMessages = snapshot.docs.map(convertDocToMessage).reverse();
        const newMessages = snapshot.docs.map(convertDocToMessage);
        // setMessages((prev) => {
        //   const existingIds = new Set(prev.map((msg) => msg.id));
        //   const filteredMessages = newMessages.filter((msg) => !existingIds.has(msg.id));
        //   return [...filteredMessages, ...prev]; // Prepend older messages
        // });
        setMessages((prev) => [...prev, ...newMessages]);
        setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
        setHasMore(snapshot.docs.length === PAGE_SIZE);

        // Preserve scroll position after loading messages
        // setTimeout(() => {
        //   const newScrollHeight = chatContainer.scrollHeight;
        //   chatContainer.scrollTop = 450;
        // }, 100);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more messages:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentChatId, hasMore, lastVisible, isLoading]);

  const handleScroll = () => {
    const { scrollTop } = scrollRefTop.current!;
    if (scrollTop < 400 && !isLoading) {
      // loadMoreMessages();
    }
  };

  // Scroll to bottom when isScroll changes
  // useEffect(() => {
  //   if (isScroll) scrollToBottom();
  // }, [isScroll, scrollToBottom]);

  /**
   * Action Functions Below
   */

  const openMenu = (e: React.MouseEvent<HTMLButtonElement>, message: Message) => {
    setCurrentMessageEvent(e.currentTarget);
    setAnchorElMenu(e.currentTarget);
    setCurrentSentById(message.sentBy.uid);

    setEditedText(decryptMessage(message.text));
    setCurrentMessageId(message.id);
    setCurrentMessage(message);
  };

  const closeMenu = () => setAnchorElMenu(null);
  const closeEmojiPicker = () => setAnchorEl(null);

  const openEmojiPicker = () => {
    setAnchorEl(currentMessageEvent);
  };

  const handleReactionSelect = async (emojiObject: any) => {
    if (!currentMessageId || !loggedInUser || !currentChatId) return;
    setAnchorEl(null);

    const messageRef = doc(db, 'chats', currentChatId, 'messages', currentMessageId);
    const userId = loggedInUser.user._id;
    const emoji = emojiObject.emoji;

    const messageDoc = await getDoc(messageRef);
    const currentReactions = messageDoc.data()?.reactions || {};

    let updatedReactions: Record<string, string[]> = {};

    // Remove user's existing reaction (if any)
    Object.keys(currentReactions).forEach((key) => {
      updatedReactions[key] = currentReactions[key].filter((id) => id !== userId);
      if (updatedReactions[key].length === 0) delete updatedReactions[key]; // Cleanup empty reactions
    });

    // Add new reaction for the user
    updatedReactions[emoji] = [...(updatedReactions[emoji] || []), userId];

    await updateDoc(messageRef, { reactions: updatedReactions });
  };

  // Message editing
  const handleSaveEdit = async () => {
    if (!editedText.trim() || !currentMessageId || !currentChatId) return;

    const messageRef = doc(db, 'chats', currentChatId, 'messages', currentMessageId);
    await updateDoc(messageRef, { text: editedText });
    setIsEditing(!IsMessageEditing);
    setEditedText('');
  };

  // Delete message
  const handleDeleteMessage = async () => {
    if (!currentChatId) return;

    const messageRef = doc(db, 'chats', currentChatId, 'messages', currentMessageId);
    await updateDoc(messageRef, {
      isDeleted: true,
      text: 'U2FsdGVkX1/J53pksDWJJNqbr3I5AmSI8/3/8PXf6uA7eYTBD2IzcqMv13wzz0CU',
      deletedAt: serverTimestamp()
    });
  };

  // Reply handling
  const handleSendReply = async () => {
    if (!replyText.trim() || !currentMessage || !currentChatId) return;

    const messgId = uuidv4();

    const replyMessage = {
      _id: messgId,
      text: replyText,
      sentBy: {
        uid: loggedInUser.user._id,
        displayName: user?.displayName || ''
      },
      sentAt: serverTimestamp(),
      replies: {
        repliedBy: loggedInUser.user._id,
        repliedTo: currentMessage.sentBy.displayName,
        repliedAt: serverTimestamp(),
        repliedText: encryptMessage(currentMessage.text)
      },
      isRead: [],
      reactions: {},
      isDeleted: false
    };

    await setDoc(doc(db, 'chats', currentChatId, 'messages', messgId), replyMessage);

    setReplyText('');
    setIsReplying(false);
    setCurrentMessage(null);
  };

  const markMessagesAsRead = async () => {
    if (!currentChatId || !messages.length) return;

    const batch = writeBatch(db);

    messages.forEach((message) => {
      if (!message.isRead?.includes(loggedInUser.user._id) && message.sentBy.uid !== loggedInUser.user._id) {
        const messageRef = doc(db, 'chats', currentChatId, 'messages', message.id);
        batch.update(messageRef, {
          isRead: arrayUnion(loggedInUser.user._id)
        });
      }
    });

    try {
      await batch.commit();
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      markMessagesAsRead();
    }
  }, [currentChatId, messages]);

  // console.log(messages, 'all messages', hasMore);

  useEffect(() => {
    console.log('loged for first render');
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          // console.log("in view");
          // console.log(msgLoading, "Message loading", firstLoad);
          // checkAlert();
          console.log('entery is visible now now wnow');
          if (!isLoading && !initialMessageLoad) {
            console.log('entery is visible now now wnow in if');
            loadMoreMessages();
          } else {
            console.log('entery is visible now now wnow in else');
          }
        } else {
          console.log('enteris not visible');
        }
      },
      { threshold: 0.5 }
    );
    const currentRef = scrollRef.current;

    if (currentRef) {
      observer.observe(currentRef);
      // console.log("get observed");
    } else {
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [isLoading, hasMore, currentChatId, initialMessageLoad]);

  return (
    <ScrollBox
      onScroll={handleScroll}
      ref={scrollRefTop}
      flex={1}
      // className={classes.scrollBox}
      display="flex"
      flexDirection="column"
      style={{ paddingRight: 60, paddingLeft: 60, overflowY: 'auto' }}
    >
      {initialMessageLoad ? (
        <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Loading....</div>
      ) : (
        <>
          {/* <div>{isLoading && 'Loading..'}</div> */}

          {messages.map((message) => {
            let isReadsAll = false;

            if (
              message.isRead.length &&
              message.sentBy.uid === loggedInUser.user._id &&
              Array.isArray(currentChat?.members) // Defensive check
            ) {
              isReadsAll = currentChat.members.filter((id) => loggedInUser.user._id !== id).every((id) => message.isRead.includes(id));
            }

            return (
              <MessageC
                key={message.id}
                // className={`${classes.message} ${message.sentBy.uid === loggedInUser.user._id ? classes.ownMessage : classes.otherMessage}`}

                $ownMessage={message.sentBy.uid === loggedInUser.user._id ? true : false}
                p={1.5}
                mt={1.5}
                // borderRadius={8}
                // display="flex"
                // flexDirection="column"
                // position="relative"
              >
                {message.isDeleted ? (
                  // <DeletedMessage className={classes.deletedMessage}>This message was deleted</Typography>
                  <DeletedMessage>This message was deleted</DeletedMessage>
                ) : (
                  <>
                    {message.replies && (
                      // <Box className={classes.replyContainer}>
                      <ReplyContainer>
                        {/* <Box className={classes.replyHeader}> */}
                        <ReplyHeader>
                          {/* <Typography variant="body2" className={classes.replySender}> */}
                          <ReplySender variant="body2">{message.replies.repliedTo}</ReplySender>
                        </ReplyHeader>
                        {/* <Box className={classes.replyMessage}> */}
                        <ReplyMessage>
                          {/* <Typography variant="body2" className={classes.replyMessageText} noWrap> */}
                          <ReplyMessageText noWrap>{decryptMessage(message.replies.repliedText)}</ReplyMessageText>
                        </ReplyMessage>
                      </ReplyContainer>
                    )}

                    {/* <Typography className={classes.senderName}> */}
                    <SenderName>{message.sentBy.uid !== loggedInUser.user._id && message.sentBy.displayName}</SenderName>

                    {IsMessageEditing && currentMessageId === message.id ? (
                      <Box>
                        {/* Editable Text Field */}
                        <TextField value={editedText} onChange={(e) => setEditedText(e.target.value)} fullWidth autoFocus />
                        <Box mt={1} display="flex" gap={1}>
                          {/* Action Buttons */}
                          <CancelButton
                            // variant="outlined"
                            color="secondary"
                            onClick={() => setIsEditing(false)}
                          >
                            Cancel
                          </CancelButton>
                          <SendButton
                            // variant="contained"
                            color="primary"
                            onClick={handleSaveEdit}
                          >
                            Send
                          </SendButton>
                        </Box>
                      </Box>
                    ) : (
                      // <Typography className={classes.messageText}>{decryptMessage(message.text)}</Typography>
                      <MessageText>{decryptMessage(message.text)}</MessageText>
                    )}

                    {isReplying && currentMessageId === message.id && (
                      <Box mt={2}>
                        <Box>
                          {/* Editable Text Field */}
                          <TextField value={replyText} onChange={(e) => setReplyText(e.target.value)} fullWidth autoFocus />
                          <Box mt={1} display="flex" gap={1}>
                            {/* Action Buttons */}
                            <CancelButton
                              // variant="outlined"
                              color="secondary"
                              onClick={() => setIsReplying(false)}
                            >
                              Cancel
                            </CancelButton>
                            <SendButton
                              // variant="contained"
                              color="primary"
                              onClick={handleSendReply}
                            >
                              Send
                            </SendButton>
                          </Box>
                        </Box>
                      </Box>
                    )}

                    {/* Render Media */}
                    {message.image && (
                      // <MediaImage mt={1}>
                      <MediaImage mt={1} src={message.image} alt="shared-media" />
                      // </MediaImage>
                    )}

                    {message.video && (
                      <Box
                      // mt={1}
                      >
                        <video src={message.video} controls style={{ width: '100%', height: '100%' }} />
                      </Box>
                    )}

                    {message.fileUrl && (
                      <Box mt={1}>
                        <UnsupportedFile>Unsupported file type</UnsupportedFile>
                      </Box>
                    )}

                    <Box display="flex" mt={1}>
                      {message.reactions &&
                        Object.entries(message.reactions).map(([reaction, userIds], index) => (
                          <Box key={index} display="flex" alignItems="center" style={{ marginRight: 8 }}>
                            <Typography variant="body2" style={{ marginRight: 4 }}>
                              {reaction} {/* Emoji */}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {userIds.length > 1 && userIds.length}
                            </Typography>
                          </Box>
                        ))}
                    </Box>

                    <Box display="flex" justifyContent="space-between" mt={0.5}>
                      <Timestamp>
                        {new Date(message.sentAt?.seconds * 1000).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Timestamp>
                      <i className="bi bi-chevron-down" style={{ cursor: 'pointer' }} onClick={(e) => openMenu(e, message)} />
                    </Box>
                  </>
                )}
              </MessageC>
            );
          })}
          <div ref={scrollRef} style={{ height: '10px', display: 'flex', width: '100%', marginTop: '5px' }}></div>
          <div>{isLoading && 'Loading..'}</div>
        </>
      )}

      <Popover open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={closeEmojiPicker}>
        <Picker reactionsDefaultOpen={true} onEmojiClick={handleReactionSelect} />
      </Popover>

      <Popover open={Boolean(anchorElMenu)} anchorEl={anchorElMenu} onClose={closeMenu}>
        {currentSentById === loggedInUser.user._id && (
          <>
            <MenuItem
              onClick={() => {
                setIsEditing(!IsMessageEditing);
                closeMenu();
              }}
            >
              Edit
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleDeleteMessage();
                closeMenu();
              }}
            >
              Delete
            </MenuItem>
          </>
        )}
        <MenuItem
          onClick={(e) => {
            openEmojiPicker();
            closeMenu();
          }}
        >
          React
        </MenuItem>
        <MenuItem
          onClick={() => {
            setIsReplying(!isReplying);
            closeMenu();
          }}
        >
          Reply
        </MenuItem>
      </Popover>

      <div ref={scrollRefBottom} />
    </ScrollBox>
  );
};

export default Messages;
