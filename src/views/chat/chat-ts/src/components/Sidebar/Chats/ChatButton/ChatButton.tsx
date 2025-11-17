import { useEffect, useState, useContext, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Chat from '../../../../../../../../types/Chat'
import { AppState } from '../../../../../../../../store/chatStore'
import {
  cutText,
  formatDate,
  getOtherPrivateChatMember,
  decryptMessage,
} from '../../../../utils'
import { Avatar, Box, Button, Typography } from '@material-ui/core'
import useStyles from './styles'
import { useParams } from 'react-router-dom'
import { setCurrentChat } from '../../../../actions'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, db } from '../../../../firebase'
import User from '../../../../../../../../types/User'
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
  updateDoc,
  doc,
  deleteDoc,
  addDoc,
  getDoc,
} from 'firebase/firestore'
import { AuthContext } from '../../../../../../../../contexts/AuthContext'
import axios from 'axios'

interface Props {
  chat: Chat
}
const apiUrl = import.meta.env.VITE_SERVER_URL
const ChatButton = ({ chat }: Props) => {
  const { auth: loggedInUser } = useContext(AuthContext)
  const classes = useStyles()
  const dispatch = useDispatch()
  const [user, loading] = useAuthState(auth)
  const [otherMember, setOtherMember] = useState<User>()
  const currentChat = useSelector((state: AppState) => state.chats.currentChat)
  const [isActive, setCurrentActive] = useState(false)
  const [countOfUnreadMessages, setCountOfUnreadMessages] = useState(0)
  const [studentIds, setStudentIds] = useState<string>();


  useEffect(() => {
    if (currentChat && currentChat.id) {
      console.log("currentChat ###########", chat.id, currentChat.id, currentChat.id === chat.id)
      setCurrentActive(currentChat.id === chat.id)
    }
  }, [currentChat])

  useEffect(() => {
    const fetchMember = async () => {
      const otherMember = await getOtherPrivateChatMember(
        chat,
        loggedInUser.user._id,
      )

      // const userId = chat.id.split('-')[0];

      //   const memberDocRef = doc(db, 'users', userId.trim())
      //   const memberSnapshot = await getDoc(memberDocRef);

      //   if(!memberSnapshot.exists()){
      //     console.log("memberSnapshot not exists *********", userId, chat)
      //   }
      //   const otherMember = memberSnapshot.exists() ? memberSnapshot.data() : null

      setOtherMember(otherMember)
    }
    if (currentChat) {
      fetchMember()
    }
  }, [currentChat])

  const subscribeMessages = () => {
    const messagesRef = collection(db, 'chats', chat.id, 'messages')

    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(messagesRef, (snapshot) => {
      const messages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      let countUnreadMessages = messages.filter(
        (m) =>
          m.sentBy.uid != loggedInUser.user._id &&
          !(m.isRead || []).includes(loggedInUser.user._id),
      ).length

      setCountOfUnreadMessages(countUnreadMessages)
    })

    return unsubscribe
  }

  useEffect(() => {
    if (!chat.id) return
    const unsubscribe = subscribeMessages()
    return () => unsubscribe()
  }, [chat.id])

  const formatDateBasedOnCondition = (date: any) => {
    let targetDate

    // Handle Firestore Timestamp
    if (date && typeof date === 'object' && 'seconds' in date) {
      targetDate = new Date(date.seconds * 1000) // Convert Firestore timestamp to Date
    } else if (date instanceof Date) {
      targetDate = date // Already a JavaScript Date
    } else if (typeof date === 'string') {
      targetDate = new Date(date) // Convert ISO string to Date
    } else {
      console.error('Invalid date provided:', date)
      return 'Invalid Date'
    }

    const today = new Date()

    // Check if the date is today
    if (
      targetDate.getDate() === today.getDate() &&
      targetDate.getMonth() === today.getMonth() &&
      targetDate.getFullYear() === today.getFullYear()
    ) {
      return targetDate.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    }

    // Check if the date is yesterday
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)

    if (
      targetDate.getDate() === yesterday.getDate() &&
      targetDate.getMonth() === yesterday.getMonth() &&
      targetDate.getFullYear() === yesterday.getFullYear()
    ) {
      return 'Yesterday'
    }

    // Otherwise, return the formatted full date
    return targetDate.toLocaleDateString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const timestamp = chat.recentMessage?.sentAt || chat.createdAt

  if (!timestamp) {
    // console.log("date invalid &&&&&&&&&&", chat)
  }

  return (
    <Button
      className={`${classes.button} ${isActive ? classes.active : ''}`}
      onClick={() => dispatch(setCurrentChat(chat))}
      fullWidth
    >
      <Box display="flex" alignItems="center" width="100%" p={1}>
        <Avatar
          className={classes.avatar}
          src={
            chat.type === 'private'
              ? `${otherMember?.photoURL}`
              : `${chat?.photoURL}
                `
          }
        />
        <Box display="flex" flexDirection="column" ml={2} width="100%">
          <Box display="flex" justifyContent="space-between">
            <Box
              display="flex"
              flexDirection="column"
              ml={2}
              width="100%"
              className={classes.chat_title}
            >
              <Typography align="left">
                {chat.type === 'private'
                  ? otherMember?.username
                    ? cutText(otherMember.username, 17)
                    : ''
                  : chat.name && cutText(chat.name, 25)}
              </Typography>
              <Typography
                variant="caption"
                color="textSecondary"
                className={
                  countOfUnreadMessages !== 0
                    ? classes.recentMessageUnread
                    : classes.recentMessage
                }
              >
                {chat.recentMessage
                  ? `${cutText(decryptMessage(chat.recentMessage.text), 12)}`
                  : ``}
              </Typography>
            </Box>
            <Box display="flex" flexDirection="column">
              <Typography variant="caption" color="textSecondary">
                {formatDateBasedOnCondition(timestamp)}
              </Typography>
              {countOfUnreadMessages !== 0 && (
                <Typography
                  variant="caption"
                  color="textSecondary"
                  className={classes.roundedButton}
                >
                  {countOfUnreadMessages}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </Button>
  )
}

export default ChatButton
