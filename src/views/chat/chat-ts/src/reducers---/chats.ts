import { AppAction, SET_CHATS, SET_CURRENT_CHAT } from '../types/actions'
import Chat from '../types/Chat'

interface Timestamp {
  seconds: number
  nanoseconds: number
}

interface User {
  uid: string
  displayName: string
}

interface Message {
  text: string
  fileUrl?: string
  sentBy: User
  sentAt: Timestamp
}

interface CurrentChat {
  id: string
  name: string
  type: 'group' | 'private'
  members: string[]
  photoURL: string,
  createdBy?: string
  createdAt: Timestamp
  recentMessage: Message
  [key: string]: any
}

interface ChatsState {
  chats: Chat[]
  currentChat: CurrentChat
}

const INIT_STATE: ChatsState = {
  chats: [],
  currentChat: {
    id: '',
    name: '',
    type: '',
    members: [],
    createdBy: undefined,
    createdAt: null as unknown as Timestamp,
    photoURL: '',
    recentMessage: {
      text: '',
      fileUrl: undefined,
      sentBy: {
        uid: '',
        displayName: '',
        photoURL: '',
      },
      sentAt: null as unknown as Timestamp,
    },
  },
}

const chatsReducer = (state = INIT_STATE, action: AppAction): ChatsState => {
  console.log(action)
  switch (action.type) {
    case SET_CHATS:
      return {
        ...state,
        chats: action.chats,
      }
    case SET_CURRENT_CHAT:
      return {
        ...state,
        currentChat: action.chat,
      }
    default:
      return state
  }
}

export { INIT_STATE as CHATS_INIT_STATE }

export default chatsReducer
