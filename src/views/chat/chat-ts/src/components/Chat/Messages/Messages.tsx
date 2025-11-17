import React, {
  useEffect,
  useRef,
  useState,
  useContext,
  useCallback,
  useMemo,
} from 'react'
import { useSelector } from 'react-redux'
import Picker from 'emoji-picker-react'
import Message from '../../../../../../../types/Message'
import _ from 'lodash'
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
  writeBatch,
} from 'firebase/firestore'
import { v4 as uuidv4 } from 'uuid'
import { db, auth } from '../../../firebase'
import { AppState } from '../../../../../../../store/chatStore'
import {
  convertDocToMessage,
  decryptMessage,
  encryptMessage,
} from '../../../utils'
import {
  Box,
  Typography,
  MenuItem,
  TextField,
  Button,
  Popover,
} from '@material-ui/core'
import useStyles from './styles'
import { useAuthState } from 'react-firebase-hooks/auth'
import { AuthContext } from '../../../../../../../contexts/AuthContext'

const PAGE_SIZE = 30

const Messages = (props: any) => {
  const { isScroll } = props
  const classes = useStyles()
  const { auth: loggedInUser } = useContext(AuthContext)
  const [user] = useAuthState(auth)
  const [currentChatId, setCurrentChatId] = useState<string>()
  const currentChat = useSelector((state: AppState) => state.chats.currentChat)
  const scrollRefTop = useRef<HTMLDivElement>(null)
  const scrollRefBottom = useRef<HTMLDivElement>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [lastVisible, setLastVisible] = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [editedText, setEditedText] = useState('')
  const [currentSentById, setCurrentSentById] = useState('')
  const [currentMessageId, setCurrentMessageId] = useState('')
  const [isReplying, setIsReplying] = useState(false)
  const [currentMessage, setCurrentMessage] = useState<Message | null>(null)
  const [replyText, setReplyText] = useState('')
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [anchorElMenu, setAnchorElMenu] = useState<null | HTMLElement>(null)
  const [currentMessageEvent, setCurrentMessageEvent] =
    useState<null | HTMLElement>(null)
  const [IsMessageEditing, setIsEditing] = useState(false)
  // Memoize scrollToBottom to prevent re-creation
  const scrollToBottom = useCallback(() => {
    scrollRefBottom.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // Sync currentChatId with Redux state
  useEffect(() => {
    if (currentChat?.id) {
      setMessages([])
      setCurrentChatId(currentChat.id)
    }
  }, [currentChat])

  // **Real-time listener for new messages**
  useEffect(() => {
    if (!currentChatId) return

    const messagesRef = collection(db, 'chats', currentChatId, 'messages')
    const q = query(messagesRef, orderBy('sentAt', 'desc'), limit(PAGE_SIZE))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const newMessages = snapshot.docs.map((doc) => convertDocToMessage(doc))

        setMessages(newMessages.reverse()) // Reverse to maintain correct order
        setLastVisible(snapshot.docs[snapshot.docs.length - 1])
        setHasMore(snapshot.docs.length === PAGE_SIZE)

        // Scroll to bottom on initial load
        setTimeout(() => {
          scrollRefBottom.current?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      }
    })

    return () => unsubscribe()
  }, [currentChatId])

  // Load more messages (pagination)
  const loadMoreMessages = useCallback(async () => {
    if (!hasMore || isLoading || !lastVisible || !currentChatId) return

    const chatContainer = scrollRefTop.current // Reference to the chat container
    if (!chatContainer) return

    const previousScrollHeight = chatContainer.scrollHeight

    setIsLoading(true)
    try {
      const messagesRef = collection(db, 'chats', currentChatId, 'messages')
      const q = query(
        messagesRef,
        orderBy('sentAt', 'desc'),
        startAfter(lastVisible),
        limit(PAGE_SIZE),
      )

      const snapshot = await getDocs(q)
      if (!snapshot.empty) {
        const newMessages = snapshot.docs.map(convertDocToMessage).reverse()
        setMessages((prev) => {
          const existingIds = new Set(prev.map((msg) => msg.id))
          const filteredMessages = newMessages.filter(
            (msg) => !existingIds.has(msg.id),
          )
          return [...filteredMessages, ...prev] // Prepend older messages
        })
        setLastVisible(snapshot.docs[snapshot.docs.length - 1])
        setHasMore(snapshot.docs.length === PAGE_SIZE)

        // Preserve scroll position after loading messages
        setTimeout(() => {
          const newScrollHeight = chatContainer.scrollHeight
          chatContainer.scrollTop = 450
        }, 100)
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error('Error loading more messages:', error)
    } finally {
      setIsLoading(false)
    }
  }, [currentChatId, hasMore, lastVisible, isLoading])

  const handleScroll = () => {
    const { scrollTop } = scrollRefTop.current
    if (scrollTop < 400 && !isLoading) {
      loadMoreMessages()
    }
  }

  // Scroll to bottom when isScroll changes
  useEffect(() => {
    if (isScroll) scrollToBottom()
  }, [isScroll, scrollToBottom])

  /**
   * Action Functions Below
   */

  const openMenu = (
    e: React.MouseEvent<HTMLButtonElement>,
    message: Message,
  ) => {
    setCurrentMessageEvent(e.currentTarget)
    setAnchorElMenu(e.currentTarget)
    setCurrentSentById(message.sentBy.uid)

    setEditedText(decryptMessage(message.text))
    setCurrentMessageId(message.id)
    setCurrentMessage(message)
  }

  const closeMenu = () => setAnchorElMenu(null)
  const closeEmojiPicker = () => setAnchorEl(null)

  const openEmojiPicker = () => {
    setAnchorEl(currentMessageEvent)
  }

  const handleReactionSelect = async (emojiObject: any) => {
    if (!currentMessageId || !loggedInUser || !currentChatId) return
    setAnchorEl(null)

    const messageRef = doc(
      db,
      'chats',
      currentChatId,
      'messages',
      currentMessageId,
    )
    const userId = loggedInUser.user._id
    const emoji = emojiObject.emoji

    const messageDoc = await getDoc(messageRef)
    const currentReactions = messageDoc.data()?.reactions || {}

    let updatedReactions: Record<string, string[]> = {}

    // Remove user's existing reaction (if any)
    Object.keys(currentReactions).forEach((key) => {
      updatedReactions[key] = currentReactions[key].filter(
        (id) => id !== userId,
      )
      if (updatedReactions[key].length === 0) delete updatedReactions[key] // Cleanup empty reactions
    })

    // Add new reaction for the user
    updatedReactions[emoji] = [...(updatedReactions[emoji] || []), userId]

    await updateDoc(messageRef, { reactions: updatedReactions })
  }

  // Message editing
  const handleSaveEdit = async () => {
    if (!editedText.trim() || !currentMessageId || !currentChatId) return

    const messageRef = doc(
      db,
      'chats',
      currentChatId,
      'messages',
      currentMessageId,
    )
    await updateDoc(messageRef, { text: editedText })
    setIsEditing(!IsMessageEditing)
    setEditedText('')
  }

  // Delete message
  const handleDeleteMessage = async () => {
    if (!currentChatId) return

    const messageRef = doc(
      db,
      'chats',
      currentChatId,
      'messages',
      currentMessageId,
    )
    await updateDoc(messageRef, {
      isDeleted: true,
      text: 'U2FsdGVkX1/J53pksDWJJNqbr3I5AmSI8/3/8PXf6uA7eYTBD2IzcqMv13wzz0CU',
      deletedAt: serverTimestamp(),
    })
  }

  // Reply handling
  const handleSendReply = async () => {
    if (!replyText.trim() || !currentMessage || !currentChatId) return

    const messgId = uuidv4()

    const replyMessage = {
      _id: messgId,
      text: replyText,
      sentBy: {
        uid: loggedInUser.user._id,
        displayName: user?.displayName || '',
      },
      sentAt: serverTimestamp(),
      replies: {
        repliedBy: loggedInUser.user._id,
        repliedTo: currentMessage.sentBy.displayName,
        repliedAt: serverTimestamp(),
        repliedText: encryptMessage(currentMessage.text),
      },
      isRead: [],
      reactions: {},
      isDeleted: false,
    }

    await setDoc(
      doc(db, 'chats', currentChatId, 'messages', messgId),
      replyMessage,
    )

    setReplyText('')
    setIsReplying(false)
    setCurrentMessage(null)
  }

  const markMessagesAsRead = async () => {
    if (!currentChatId || !messages.length) return

    const batch = writeBatch(db)

    messages.forEach((message) => {
      if (
        !message.isRead?.includes(loggedInUser.user._id) &&
        message.sentBy.uid !== loggedInUser.user._id
      ) {
        const messageRef = doc(
          db,
          'chats',
          currentChatId,
          'messages',
          message.id,
        )
        batch.update(messageRef, {
          isRead: arrayUnion(loggedInUser.user._id),
        })
      }
    })

    try {
      await batch.commit()
    } catch (error) {
      console.error('Error marking messages as read:', error)
    }
  }
  useEffect(() => {
    if (messages.length > 0) {
      markMessagesAsRead()
    }
  }, [currentChatId, messages]);



  return (
    <Box
      onScroll={handleScroll}
      ref={scrollRefTop}
      flex={1}
      className={classes.scrollBox}
      display="flex"
      flexDirection="column"
      style={{ paddingRight: 60, paddingLeft: 60, overflowY: 'auto' }}
    >
      <div>{isLoading && 'Loading..'}</div>
      {messages.map((message) => {
        let isReadsAll = false

        if (
          message.isRead.length &&
          message.sentBy.uid === loggedInUser.user._id &&
          Array.isArray(currentChat?.members) // Defensive check
        ) {
          isReadsAll = currentChat.members
            .filter((id) => loggedInUser.user._id !== id)
            .every((id) => message.isRead.includes(id))
        }

        return (
          <Box
            key={message.id}
            className={`${classes.message} ${
              message.sentBy.uid === loggedInUser.user._id
                ? classes.ownMessage
                : classes.otherMessage
            }`}
            p={1.5}
            mt={1.5}
            borderRadius={8}
            display="flex"
            flexDirection="column"
            position="relative"
          >
            {message.isDeleted ? (
              <Typography className={classes.deletedMessage}>
                This message was deleted
              </Typography>
            ) : (
              <>
                {message.replies && (
                  <Box className={classes.replyContainer}>
                    <Box className={classes.replyHeader}>
                      <Typography
                        variant="body2"
                        className={classes.replySender}
                      >
                        {message.replies.repliedTo}
                      </Typography>
                    </Box>
                    <Box className={classes.replyMessage}>
                      <Typography
                        variant="body2"
                        className={classes.replyMessageText}
                        noWrap
                      >
                        {decryptMessage(message.replies.repliedText)}
                      </Typography>
                    </Box>
                  </Box>
                )}

                <Typography className={classes.senderName}>
                  {message.sentBy.uid !== loggedInUser.user._id &&
                    message.sentBy.displayName}
                </Typography>

                {IsMessageEditing && currentMessageId === message.id ? (
                  <Box>
                    {/* Editable Text Field */}
                    <TextField
                      value={editedText}
                      onChange={(e) => setEditedText(e.target.value)}
                      fullWidth
                      autoFocus
                    />
                    <Box mt={1} display="flex" gap={1}>
                      {/* Action Buttons */}
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => setIsEditing(false)}
                        className={classes.cancelButton}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSaveEdit}
                        className={classes.sendButton}
                      >
                        Send
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Typography className={classes.messageText}>
                    {decryptMessage(message.text)}
                  </Typography>
                )}

                {isReplying && currentMessageId === message.id && (
                  <Box mt={2}>
                    <Box>
                      {/* Editable Text Field */}
                      <TextField
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        fullWidth
                        autoFocus
                      />
                      <Box mt={1} display="flex" gap={1}>
                        {/* Action Buttons */}
                        <Button
                          variant="outlined"
                          color="secondary"
                          onClick={() => setIsReplying(false)}
                          className={classes.cancelButton}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleSendReply}
                          className={classes.sendButton}
                        >
                          Send
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                )}

                {/* Render Media */}
                {message.image && (
                  <Box mt={1}>
                    <img
                      src={message.image}
                      alt="shared-media"
                      className={classes.mediaImage}
                    />
                  </Box>
                )}

                {message.video && (
                  <Box mt={1}>
                    <video
                      src={message.video}
                      controls
                      className={classes.mediaVideo}
                    />
                  </Box>
                )}

                {message.fileUrl && (
                  <Box mt={1}>
                    <Typography className={classes.unsupportedFile}>
                      Unsupported file type
                    </Typography>
                  </Box>
                )}

                <Box display="flex" mt={1}>
                  {message.reactions &&
                    Object.entries(message.reactions).map(
                      ([reaction, userIds], index) => (
                        <Box
                          key={index}
                          display="flex"
                          alignItems="center"
                          style={{ marginRight: 8 }}
                        >
                          <Typography
                            variant="body2"
                            style={{ marginRight: 4 }}
                          >
                            {reaction} {/* Emoji */}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {userIds.length > 1 && userIds.length}
                          </Typography>
                        </Box>
                      ),
                    )}
                </Box>

                <Box display="flex" justifyContent="space-between" mt={0.5}>
                  <Typography className={classes.timestamp}>
                    {new Date(
                      message.sentAt?.seconds * 1000,
                    ).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Typography>
                  <i
                    className="bi bi-chevron-down"
                    style={{ cursor: 'pointer' }}
                    onClick={(e) => openMenu(e, message)}
                  />
                </Box>
              </>
            )}
          </Box>
        )
      })}

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={closeEmojiPicker}
      >
        <Picker
          reactionsDefaultOpen={true}
          onEmojiClick={handleReactionSelect}
        />
      </Popover>

      <Popover
        open={Boolean(anchorElMenu)}
        anchorEl={anchorElMenu}
        onClose={closeMenu}
      >
        {currentSentById === loggedInUser.user._id && (
          <>
            <MenuItem
              onClick={() => {
                setIsEditing(!IsMessageEditing)
                closeMenu()
              }}
            >
              Edit
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleDeleteMessage()
                closeMenu()
              }}
            >
              Delete
            </MenuItem>
          </>
        )}
        <MenuItem
          onClick={(e) => {
            openEmojiPicker()
            closeMenu()
          }}
        >
          React
        </MenuItem>
        <MenuItem
          onClick={() => {
            setIsReplying(!isReplying)
            closeMenu()
          }}
        >
          Reply
        </MenuItem>
      </Popover>

      <div ref={scrollRefBottom} />
    </Box>
  )
}

export default Messages
