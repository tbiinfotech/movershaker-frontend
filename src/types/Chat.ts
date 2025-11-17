import Message from './Message'
import User from './User'

interface Chat {
  id: string
  name: string
  groupName: string,
  type: string
  members: User[]
  photoURL: string
  recentMessage: Message
  createdBy: string
  createdAt: string
  isChatRoomAllowed: boolean
}

export default Chat
